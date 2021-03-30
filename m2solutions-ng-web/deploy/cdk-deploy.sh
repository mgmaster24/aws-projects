#!/bin/sh
set -euxo pipefail

# Due to the way the CDK operates, there is no option to just pass in the region like you can with cfn deploy, etc.
# This means we must set the AWS_REGION variable to the region we wish to deploy in. It's important to remember that
# the variable will need to be set back to its original value after the CDK deploys are finished
AWS_REGION=$SHARED_ACCOUNT_CD_REGION

cd $CODEBUILD_SRC_DIR/packages/cdk

npx cdk deploy --app dist/src/bin/cloud-front.js --context StackName=$DEPLOY_STACK_NAME_PREFIX-ui --tags $CDK_TAGS
