import { Construct, Stack, CfnOutput } from '@aws-cdk/core';
import { ARecord, HostedZone, IHostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Version } from '@aws-cdk/aws-lambda';
import {
  CloudFrontWebDistribution,
  HttpVersion,
  PriceClass,
  OriginAccessIdentity,
  CloudFrontAllowedMethods,
  CloudFrontAllowedCachedMethods,
  LambdaEdgeEventType
} from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';
import { ICloudFrontStackParameters, ICloudFrontStackProps } from './interfaces';

export class CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props: ICloudFrontStackProps) {
    super(scope, id, props);

    const cloudFrontStackParams: ICloudFrontStackParameters = props.parameters;
    const rootDomain: string = cloudFrontStackParams.deploymentDomain;
    let domains: string[] = [];
    if (cloudFrontStackParams.aliases) {
      const subDomains: string[] = cloudFrontStackParams.aliases.split(',');
      domains = subDomains.map((subDomain) => {
        return `${subDomain}.${rootDomain}`;
      });
    }

    const cfDistro = new CloudFrontWebDistribution(this, 'WebUICloudFrontDistribution', {
      defaultRootObject: 'index.html',
      httpVersion: HttpVersion.HTTP2,
      priceClass: PriceClass.PRICE_CLASS_100,
      errorConfigurations: [
        {
          errorCachingMinTtl: 300,
          errorCode: 403,
          responseCode: 200,
          responsePagePath: '/index.html'
        },
        {
          errorCachingMinTtl: 300,
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html'
        }
      ],
      originConfigs: [
        {
          s3OriginSource: {
            originAccessIdentity: OriginAccessIdentity.fromOriginAccessIdentityName(
              this,
              'OAI',
              cloudFrontStackParams.webUIOriginAccessIdentityId
            ),
            s3BucketSource: Bucket.fromBucketName(this, 'WebBucket', cloudFrontStackParams.webUIBucketName)
          },
          behaviors: [
            {
              allowedMethods: CloudFrontAllowedMethods.ALL,
              cachedMethods: CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
              forwardedValues: {
                queryString: false
              },
              isDefaultBehavior: true,
              lambdaFunctionAssociations: [
                {
                  eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
                  lambdaFunction: Version.fromVersionArn(
                    this,
                    'lambdaFunction',
                    cloudFrontStackParams.cfOriginResponseDefaultBehaviorLambdaArn
                  )
                }
              ]
            }
          ],
          originPath: `/${cloudFrontStackParams.webBuildId}`,
          originHeaders: { ['x-extron-csp-trusted-domains']: cloudFrontStackParams.contentSecurityPolicyTrustedDomains }
        }
      ],
      viewerCertificate: {
        aliases: domains,
        props: {
          acmCertificateArn: cloudFrontStackParams.certificateArn,
          minimumProtocolVersion: 'TLSv1.2_2018',
          sslSupportMethod: 'sni-only'
        }
      },
      webACLId: cloudFrontStackParams.webAclId
    });

    const hostedZone: IHostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: cloudFrontStackParams.hostedZoneId,
      zoneName: rootDomain
    });

    const cfTarget = new CloudFrontTarget(cfDistro);
    domains.forEach((domain, i) => {
      new ARecord(this, `AliasRecord${i}`, {
        recordName: domain,
        zone: hostedZone,
        target: RecordTarget.fromAlias(cfTarget)
      });
    });

    new CfnOutput(this, 'WebUICloudFrontDistributionId', {
      value: cfDistro.distributionId,
      description: 'The distribution identifier (i.e. E3OCL4OHK7OEJ5)'
    });
  }
}
