import fs from "fs";
import {
    CloudFormationClient,
    CreateStackCommand,
    DeleteStackCommand,
    DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
const client = new CloudFormationClient({ region: process.env.AWS_REGION });

const getEnvValue = (key: string): string => {
    const value = process.env[key];
    if (value == undefined) throw new Error(`Invalid Environment key : ${key}`);
    return value;
};

const PROJECT_PREFIX = getEnvValue("PROJECT_PREFIX");
const REPOSITORY_NAME = getEnvValue("REPOSITORY_NAME");

const createStack = async (branchName: string): Promise<void> => {
    await client.send(
        new CreateStackCommand({
            StackName: `${PROJECT_PREFIX}CICD-${branchName}`,
            TemplateBody: fs.readFileSync("pipeline.yml", {
                encoding: "utf-8",
            }),
            Parameters: Object.entries({
                ProjectPrefix: PROJECT_PREFIX,
                ArtifactStoreBucket: getEnvValue("ARTIFACT_BUCKET"),
                StackName: `${PROJECT_PREFIX}App-${branchName}`,
                RepositoryName: REPOSITORY_NAME,
                CodeBuildProjectName: getEnvValue("CODEBUILD_PROJECT_NAME"),
                BranchName: branchName,
                CodePipelineRoleArn: getEnvValue("PIPELINE_ROLE_ARN"),
                DeployRoleForCodePipelineArn: getEnvValue(
                    "DEPLOY_ROLE_FOR_CODEPIPELINE_ARN"
                ),

                PackagedTemplateFilePath: getEnvValue(
                    "PACKAGED_TEMPLATE_FILE_PATH"
                ),
                DeployParamFile: getEnvValue("DEPLOY_PARAM_FILE"),
            }).map(
                ([key, value]: [string, string]): {
                    ParameterKey: string;
                    ParameterValue: string;
                } => ({
                    ParameterKey: key,
                    ParameterValue: value,
                })
            ),
            Capabilities: ["CAPABILITY_AUTO_EXPAND"],
        })
    );
};

const deleteStack = async (branchName: string): Promise<void> => {
    const stackName = `${PROJECT_PREFIX}CICD-${branchName}`;
    const stacks = await client.send(
        new DescribeStacksCommand({ StackName: stackName })
    );
    if (!stacks.Stacks || stacks.Stacks.length === 0) {
        return;
    }
    await client.send(new DeleteStackCommand({ StackName: stackName }));
};

export const handler = async (event: {
    detail: {
        repositoryName: string;
        event: string;
        referenceName: string;
    };
}): Promise<{ status: string }> => {
    console.dir(event);
    const detail = event.detail;
    if (detail.repositoryName !== REPOSITORY_NAME) {
        throw new Error(`Invalid repositoryName: ${detail.repositoryName}`);
    }
    // https://docs.aws.amazon.com/codecommit/latest/userguide/monitoring-events.html#referenceCreated
    if (detail.event === "referenceCreated") {
        await createStack(detail.referenceName);
        // https://docs.aws.amazon.com/codecommit/latest/userguide/monitoring-events.html#referenceDeleted
    } else if (detail.event === "referenceDeleted") {
        await deleteStack(detail.referenceName);
    }
    return { status: "OK" };
};
