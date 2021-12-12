#!/usr/bin/env bash

SOURCE_DIR=$(cd $(dirname ${BASH_SOURCE:-0}) && pwd)
cd ${SOURCE_DIR}

AWS_LAMBDA_ZIP_PACKAGED_BUCKET="***Your S3 Bucket for AWS Lambda zip packaged. This should've been already created***"
CICD_ARTIFACT_BUCKET="***Your S3 Bucket for CI/CD Artifact***"
CICD_STACK_NAME="CICD"

# compile and copy template to the build direcory
yarn compile
cp -r node_modules src/pipeline.yml build/src/

# package
aws cloudformation package \
    --template-file template.yml \
    --s3-bucket ${AWS_LAMBDA_ZIP_PACKAGED_BUCKET} \
    --output-template-file packaged_template.yml

# deploy
aws cloudformation deploy \
    --template-file packaged_template.yml \
    --stack-name ${CICD_STACK_NAME} \
    --parameter-overrides \
        BucketName=${CICD_ARTIFACT_BUCKET} \
   --capabilities CAPABILITY_NAMED_IAM
