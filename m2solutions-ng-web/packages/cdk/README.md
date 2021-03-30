# CDK Package

Responsible for generating CloudFormation templates and/or deploying infrastructure as code packages.

> The templates defined in this project should fall under the "build once, deployed many" paradigm, which is the best practice when using the CDK to generate templates.
>
> **The exception to this rule is the Cloud Front distribution template**. This template is generated during deploy time because the number of tenants is unknown at build time.

## Getting Started

### Run Unit Tests

- Run `npm run test` to run unit all unit tests and report coverage
- Run `npm run test:dev` to run unit tests
- Run `npm run test:dev:watch` to run unit tests in watch mode

> NOTE: Use the VSCode Debugger to debug unit tests, which is already configured in the `.vscode/launch.json` configuration.

### Linting

- Run `npm run lint`

## Deployment Steps

### 1. AWS Cloud Development Kit steps for deploying the CloudFront distribution.

> NOTE: This is not the ideal way of handling deployments. Since the number of tenant subdomains (aliases) is unknown at the time the TAP project is built we can **NOT** create a CloudFormation template ahead of deployment time. This goes against our philosophy of **_build once, deploy many_**.

#### Required Parameters

| Parameter                                        | Example Value                                                                                      | Description                                                                                                                                                                                           |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DeploymentDomain                                 | box.nortxe.com                                                                                     | The domain name to use for the web application                                                                                                                                                        |
| Aliases                                          | subdomain1, subdomain2,subdomain3,etc.                                                             | The list of subdomains to alias in the CloudFront distribution                                                                                                                                        |
| HostedZoneId                                     | JSDF045ASFAKEDSFGSDF                                                                               | The top level domain                                                                                                                                                                                  |
| WebUIBucketName                                  | {{bucket-created-in-step-2}                                                                        | The name of the Amazon S3 bucket where the Web UI will originate                                                                                                                                      |
| WebBuildId                                       | da8d8fb2-91eb-4529-b485-9379dc371ccc                                                               | The web application build ID from CI                                                                                                                                                                  |
| CertificateArn                                   | {{cert-arn}                                                                                        | The certificate arn created in the certificate stack                                                                                                                                                  |
| WebUIOriginAccessIdentityId                      | E19GFAKEFHPA1H9                                                                                    | The ID of the OriginaAccessIdentity for the TAP UI                                                                                                                                                    |
| CloudFrontOriginResponseDefaultBehaviorLambdaArn | {fully-qualified-arn}                                                                              | The fully-qualified Lambda ARN associated with the CloudFront Origin Response Event for the CloudFront default behavior. **NOTE: This value is output from the cloudfront-events serverless stacks.** |
| ContentSecurityPolicyTrustedDomains              | https://\*.extroncloud.com https://\*.launchdarkly.com https://cognito-idp.us-east-1.amazonaws.com | A space-separated list of trusted domains the CSP will use for the connect-src fetch directive                                                                                                        |
| WebAclId                                         | 605xxxxx-8axx-4cxx-9cxx-0a55exxxxxxx                                                               | A unique identifier that specifies the AWS WAF web ACL                                                                                                                                                |

1. Update the properties JSON file located at `./packages/cdk/src/properties/cloud-front.properties.json` with the values above. This file will be read by the [cloud-front.stack.ts](../../packages/cdk/src/lib/cloud-front.stack.ts) when we call deploy.
2. Build the CDK package. There are two options available to complete this step.
   1. The CDK package is bootstapped using lerna. Since this is the case a build can be executed from the root directory of the TAP project. Run `npm run build` from root directory.
   2. - `cd` to `./packages/cdk`
      - Run `npm run build`
3. Run `cdk deploy --app {{path-to-cdk-package}}/dist/src/bin/cloud-front.js --context StackName={{your-name}}-em-tap-ui

> NOTE - This template must be ran in region us-east-1.

#### Stack Outputs

| Output Name                   | Description                 |
| ----------------------------- | --------------------------- |
| WebUICloudFrontDistributionId | The distribution identifier |
