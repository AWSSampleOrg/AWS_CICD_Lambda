### AWS CI/CD

CI/CD sample Source with CodeCommit, CodeBuild, CodePipeline

When the new git branch is created (pushed sources) in the CodeCommit Repository,
The Lambda which creates a new CodePipeline for its branch would be triggered by EventBridge.
