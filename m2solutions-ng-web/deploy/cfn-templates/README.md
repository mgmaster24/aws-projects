# Extron Operations Platform Web UI CloudFormation Templates

A set of CloudFormation templates which, when ran, will create both TAP UI and the TAP UI Discovery Service.

## Deployment Steps

### 1. Create the WebUI Origin Access Identity (OAI)

AWS CloudFormation template for creating the web application's OAI.

#### Required Parameters:

N/A

1. Run `aws cloudformation create-stack --stack-name {{your-name}}-em-tap-ui-origin-access-identity --template-body file://{{path-to-template}}/em-tap-ui-origin-access-identity.template.yaml --parameters file://{{path-to-answers}}/{{your-name}}-em-tap-ui-origin-access-identity.answers.json --region us-east-1`.

> NOTE - This template must be ran in region us-east-1.

#### Stack Outputs

| Output Name                 | Description                             |
| --------------------------- | --------------------------------------- |
| WebUIOriginAccessIdentityId | The Origin Access Identity's identifier |

### 2. Create S3 Bucket for Web UI CloudFront Distribution

AWS CloudFormation template for creating the S3 Bucket that hosts the UI code and assets

#### Required Parameters

| Parameter                   | Example Value  | Description                         |
| --------------------------- | -------------- | ----------------------------------- |
| WebUIOriginAccessIdentityId | E3OCL4OHK7OEJ5 | The ID of the OriginaAccessIdentity |

1. Clone `./deploy/cfn-templates/example-em-tap-ui-bucket.answers.json` and name it `{{your-name}}-em-tap-ui-bucket.answers.json`. NOTE: This file should not be checked into source control.
2. Run `aws cloudformation create-stack --stack-name {{yourname}}-em-tap-ui-bucket --template-body file://{{path-to-template}}/em-tap-ui-bucket.template.yaml --parameters file://{{path-to-answers}}/{{your-name}}-em-tap-ui-bucket.answers.json --region us-east-1`

> NOTE - This template must be ran in region us-east-1.

#### Stack Outputs

| Output Name       | Description                                 |
| ----------------- | ------------------------------------------- |
| S3BucketName      | The S3 bucket name                          |
| S3BucketSecureURL | Name of S3 bucket that hosts the UI content |

### 3. Create Certificate for the UI CloudFront Distribution

AWS CloudFormation template to create a custom domain name and certificate

#### Required Parameters

| Parameter         | Example Value      | Description                                                                                        |
| ----------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| DomainName        | ui.extroncloud.com | The top level domain                                                                               |
| HostedZoneId      | JSDF045ASDSFGSDF   | The Route53 Hosted Zone ID                                                                         |
| AutoCertApproval  | True               | Turn on automatic approval of certificates through DNS when set to true. **NOTE: USE THIS OPTION** |
| EmailCertApproval | False              | Turn on manual email approval of certificates when set to true. **NOTE: DO NOT USE THIS OPTION**   |

1. Clone `./deploy/cfn-templates/example-em-tap-ui-certificate.answers.json` and name it `{{your-name}}-em-tap-ui-certificate.answers.json`. NOTE: This file should not be checked into source control.
2. Run `aws cloudformation create-stack --stack-name {{yourname}}-em-tap-ui-certificate --template-body file://{{path-to-template}}/em-tap-ui-certificate.template.yaml --parameters file://{{path-to-answers}}/{{your-name}}-em-tap-ui-certificate.answers.json --region us-east-1`

> NOTE - This template must be ran in region us-east-1.

#### Stack Outputs

| Output Name                   | Description                         |
| ----------------------------- | ----------------------------------- |
| EmTapUIDomainCertificate      | EM TAP UI Custom Domain Certificate |
| EmTapUIDomainCertificateEmail | EM TAP UI Custom Domain Certificate |

### 4. Deploy the CloudFront Origin Behavior Lambda Integrations

See [readme](../../packages/cloudfront-events/README.md) for deployment instructions

### 5. Create the CloudFront Distribution

AWS Cloud Development Kit steps for deploying the CloudFront distribution.

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

### 6. Create S3 Bucket for Custom Resources

AWS CloudFormation template for creating the S3 bucket that hosts the CloudFormation custom resources (lulo plugin)

> Required by the discovery service template

#### Required Parameters

N/A

1. Run `aws cloudformation create-stack --stack-name {{your-name}}-em-tap-ui-custom-resources-s3-bucket --template-body file://{{path-to-template}}/em-tap-ui-custom-resources-s3-bucket.template.yaml --parameters file://{{path-to-answers}}/{{your-name}}-em-tap-ui-custom-resources-s3-bucket.answers.json --region {{region}}`.

#### Stack Outputs

| Output Name  | Description                                                               |
| ------------ | ------------------------------------------------------------------------- |
| S3BucketName | Name of the S3 Bucket that will host the CloudFormation custom resources. |

### 7. Create Discovery Service Prerequisites

AWS CloudFormation template for deploying the necessary prerequisites needed by the Discovery Service.

#### Required Parameters

| Parameter               | Example Value                           | Description                                                                                         |
| ----------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ArtifactBucketKey       | file/location/path/custom-resources.zip | The key which is the path to the .zip file that contains the deployment                             |
| ArtifactBucketName      | {{name-of-bucket-from-previous-step}}   | The name of the Amazon S3 bucket where the .zip file that contains the deployment package is stored |
| DeploymentSubdomainName | box.nortxe.com                          | The name of the stack containing the Subdomain output                                               |
| DiscoverySubdomain      | {{your-name}}-tap-discovery             | The subdomain under which the discovery service will be hosted                                      |
| HostedZoneId            | Z091164FAKEFN62W6LTHN                   | The HostedZone ID for the DeploymentSubdomainName                                                   |

1. Clone `./deploy/cfn-templates/example-em-tap-ui-discovery.answers.json` and name it `{{your-name}}-em-tap-ui-discovery.answers.answers.json`.
2. Run `aws cloudformation create-stack --stack-name {{your-name}}-em-tap-ui-discovery --template-body file://{{path-to-template}}/em-tap-ui-discovery.template.yaml --parameters file://{{path-to-answers}}/{{your-name}}-em-tap-ui-discovery.answers.json --region {{region}}`.

#### Stack Outputs

| Output Name          | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| DiscoveryEndpointUri | The location of the operations discovery endpoint that was created |

### 8. Deploy Discovery Service Serverless Project

See [readme](../../packages/discovery/README.md) for deployment instructions

### 9. Create S3 Bucket for Downloads

Responsible for creating the S3 bucket used for downloads such as the device onboarding tool

#### Required Parameters

N/A

1. Run `aws cloudformation create-stack --stack-name {{yourname}}-em-tap-ui-downloads-s3-bucket --template-body file://{{path-to-template}}/em-tap-ui-downloads-s3-bucket.template.yaml --region {{region}}`

#### Stack Outputs

| Output Name  | Description                                |
| ------------ | ------------------------------------------ |
| S3BucketName | The name of the S3 bucket that was created |

### 10. Create Downloads Service Prerequisites

AWS CloudFormation template for deploying the necessary prerequisites needed by the Downloads Service.

#### Required Parameters

| Parameter               | Example Value                           | Description                                                                                         |
| ----------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ArtifactBucketKey       | file/location/path/custom-resources.zip | The key which is the path to the .zip file that contains the deployment                             |
| ArtifactBucketName      | {{name-of-bucket-from-step-6}}          | The name of the Amazon S3 bucket where the .zip file that contains the deployment package is stored |
| DeploymentSubdomainName | box.nortxe.com                          | The name of the stack containing the Subdomain output                                               |
| Subdomain               | {{your-name}}-tap-downloads             | The subdomain under which the discovery service will be hosted                                      |
| HostedZoneId            | Z091164FAKEFN62W6LTHN                   | The HostedZone ID for the DeploymentSubdomainName                                                   |

1. Clone `./deploy/cfn-templates/example-em-tap-ui-api-domain.answers.json` and name it `{{your-name}}-em-tap-ui-api-domain.answers.json`.
2. Run `aws cloudformation create-stack --stack-name {{your-name}}-em-tap-ui-downloads-service --template-body file://{{path-to-template}}/em-tap-ui-downloads-api-domain.template.yaml --parameters file://{{path-to-answers}}/{{your-name}}-em-tap-ui-api-domain.answers.json --region {{region}}`.

#### Stack Outputs

| Output Name | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| EndpointUri | The location of the operations discovery endpoint that was created |

### 11. Deploy Downloads Service Serverless Project

See [readme](../../packages/downloads-service/README.md) for deployment instructions

### 12. Create Datadog Monitors

Responsible for creating monitors and alerts for Tenant Access Portal (TAP)

#### Required Parameters

| Parameter                  | Example Value              | Description                                        |
| -------------------------- | -------------------------- | -------------------------------------------------- |
| Environment                | {{your-name}}              | The environment in which this template is deployed |
| NotificationHandle         | @teams-team-tmi-alerts-dev | The notification handle for sending alerts         |
| DatadogApiKeySMKey         | /cicd/datadog/dd_api_key   | The Datadog API key Secrets Manager key            |
| DatadogApplicationKeySMKey | /cicd/datadog/dd_app_key   | The Datadog application key Secrets Manager key    |

1. Clone `deploy/cfn-templates/example-em-tap-ui-monitors.answers.json` and name it `{{your-name}}-em-tap-ui-monitors.answers.json`. NOTE: This file should not be checked into source control.
2. Run `aws cloudformation create-stack --stack-name {{yourname}}-em-tap-ui-monitors --template-body file://{{path-to-template}}/em-tap-ui-monitors.template.yaml --parameters file://{{path-to-answers}}/{{your-name}}-em-tap-ui-monitors.answers.json --region {{region}}`

#### Stack Outputs

N/A
