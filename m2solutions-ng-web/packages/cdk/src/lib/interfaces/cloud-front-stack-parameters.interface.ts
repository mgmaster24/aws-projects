export interface ICloudFrontStackParameters {
  aliases: string;
  deploymentDomain: string;
  hostedZoneId: string;
  webUIBucketName: string;
  webBuildId: string;
  certificateArn: string;
  webUIOriginAccessIdentityId: string;
  cfOriginResponseDefaultBehaviorLambdaArn: string;
  contentSecurityPolicyTrustedDomains: string;
  webAclId: string;
}
