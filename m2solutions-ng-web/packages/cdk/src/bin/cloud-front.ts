#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import * as fs from 'fs';
import { CloudFrontStack } from '../lib/cloud-front.stack';
import { ICloudFrontStackParameters, ICloudFrontStackProps } from '../lib/interfaces';

const app = new App();

let appName = process.env.EXTRON_APP_NAME;

// Set defaults for when not running in the buildspec
if (!appName) {
  appName = 'em-tap-ui';
}

const stackName = app.node.tryGetContext('StackName');
if (!stackName) {
  throw new Error('Missing StackName contextual param, must pass --context StackName=<stack-name>');
}

const cloudFrontStackParametersFile: Buffer = fs.readFileSync(`./src/properties/cloud-front.properties.json`);
const parameters = JSON.parse(cloudFrontStackParametersFile.toString('utf-8'));
const cloudFrontStackParameters: ICloudFrontStackParameters = {
  aliases: parameters.Aliases,
  certificateArn: parameters.CertificateArn,
  cfOriginResponseDefaultBehaviorLambdaArn: parameters.CfOriginResponseDefaultBehaviorLambdaArn,
  contentSecurityPolicyTrustedDomains: parameters.ContentSecurityPolicyTrustedDomains,
  deploymentDomain: parameters.DeploymentDomain,
  hostedZoneId: parameters.HostedZoneId,
  webBuildId: parameters.WebBuildId,
  webUIBucketName: parameters.WebUIBucketName,
  webUIOriginAccessIdentityId: parameters.WebUIOriginAccessIdentityId,
  webAclId: parameters.WebACLId
};
const cloudFrontStackProps: ICloudFrontStackProps = {
  env: {
    region: process.env.AWS_REGION
  },
  stackName,
  parameters: cloudFrontStackParameters
};

new CloudFrontStack(app, `${appName}-cloud-front`, cloudFrontStackProps);
