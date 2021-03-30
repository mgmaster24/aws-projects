import { expect as expectCDK, countResourcesLike, countResources, haveResource } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { CloudFrontStack } from '../lib/cloud-front.stack';
import { ICloudFrontStackProps } from '../lib/interfaces';

describe(`${CloudFrontStack.name} test`, () => {
  test('should have a CloudFront distro', () => {
    const app = new App();

    const cloudFrontStackProps: ICloudFrontStackProps = {
      parameters: {
        aliases: 'tenant1,tenant2,tenant3,tenant4',
        deploymentDomain: 'testdomain.com',
        certificateArn: 'aws:acm:us-east-1:123456789012:certificate/57954d5f-7139-4673-b329-35d8acd592f9',
        cfOriginResponseDefaultBehaviorLambdaArn:
          'arn:aws:lambda:us-east-1:123456789012:function:test-em-tap-ui-cloudfront-events-originResponse:2',
        contentSecurityPolicyTrustedDomains:
          'https://*.testdomain.com https://*.launchdarkly.com https://cognito-idp.us-east-1.amazonaws.com',
        hostedZoneId: 'Z1234567HI321TESTZID',
        webBuildId: '3TEST24',
        webUIBucketName: 'test-em-tap-ui-bucket-statictenantwebhostings3mm-test1234name',
        webUIOriginAccessIdentityId: 'E5X24HI6Z3M8W',
        webAclId: '605xxxxx-8axx-4cxx-9cxx-0a55exxxxxxx'
      }
    };
    const stack = new CloudFrontStack(app, 'MyTestStack', cloudFrontStackProps);
    // THEN
    expectCDK(stack).to(countResources('AWS::CloudFront::Distribution', 1));
    expectCDK(stack).to(countResourcesLike('AWS::Route53::RecordSet', 4, { Type: 'A' }));
    expectCDK(stack).to(
      haveResource('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Aliases: [
            'tenant1.testdomain.com',
            'tenant2.testdomain.com',
            'tenant3.testdomain.com',
            'tenant4.testdomain.com'
          ],
          CustomErrorResponses: [
            {
              ErrorCachingMinTTL: 300,
              ErrorCode: 403,
              ResponseCode: 200,
              ResponsePagePath: '/index.html'
            },
            {
              ErrorCachingMinTTL: 300,
              ErrorCode: 404,
              ResponseCode: 200,
              ResponsePagePath: '/index.html'
            }
          ],
          DefaultCacheBehavior: {
            AllowedMethods: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
            CachedMethods: ['GET', 'HEAD', 'OPTIONS'],
            Compress: true,
            ForwardedValues: {
              QueryString: false
            },
            LambdaFunctionAssociations: [
              {
                EventType: 'origin-response',
                LambdaFunctionARN:
                  'arn:aws:lambda:us-east-1:123456789012:function:test-em-tap-ui-cloudfront-events-originResponse:2'
              }
            ],
            TargetOriginId: 'origin1',
            ViewerProtocolPolicy: 'redirect-to-https'
          },
          DefaultRootObject: 'index.html',
          Enabled: true,
          HttpVersion: 'http2',
          IPV6Enabled: true,
          Origins: [
            {
              ConnectionAttempts: 3,
              ConnectionTimeout: 10,
              DomainName: {
                'Fn::Join': [
                  '',
                  [
                    'test-em-tap-ui-bucket-statictenantwebhostings3mm-test1234name.s3.',
                    {
                      Ref: 'AWS::Region'
                    },
                    '.',
                    {
                      Ref: 'AWS::URLSuffix'
                    }
                  ]
                ]
              },
              Id: 'origin1',
              OriginCustomHeaders: [
                {
                  HeaderName: 'x-extron-csp-trusted-domains',
                  HeaderValue:
                    'https://*.testdomain.com https://*.launchdarkly.com https://cognito-idp.us-east-1.amazonaws.com'
                }
              ],
              OriginPath: '/3TEST24',
              S3OriginConfig: {
                OriginAccessIdentity: 'origin-access-identity/cloudfront/E5X24HI6Z3M8W'
              }
            }
          ],
          PriceClass: 'PriceClass_100',
          ViewerCertificate: {
            AcmCertificateArn: 'aws:acm:us-east-1:123456789012:certificate/57954d5f-7139-4673-b329-35d8acd592f9',
            MinimumProtocolVersion: 'TLSv1.2_2018',
            SslSupportMethod: 'sni-only'
          },
          WebACLId: '605xxxxx-8axx-4cxx-9cxx-0a55exxxxxxx'
        }
      })
    );
    expectCDK(stack).to(
      haveResource('AWS::Route53::RecordSet', {
        Name: 'tenant1.testdomain.com.',
        Type: 'A',
        AliasTarget: {
          DNSName: {
            'Fn::GetAtt': ['WebUICloudFrontDistributionCFDistribution7213B062', 'DomainName']
          },
          HostedZoneId: {
            'Fn::FindInMap': [
              'AWSCloudFrontPartitionHostedZoneIdMap',
              {
                Ref: 'AWS::Partition'
              },
              'zoneId'
            ]
          }
        },
        HostedZoneId: 'Z1234567HI321TESTZID'
      })
    );
    expectCDK(stack).to(
      haveResource('AWS::Route53::RecordSet', {
        Name: 'tenant2.testdomain.com.',
        Type: 'A',
        AliasTarget: {
          DNSName: {
            'Fn::GetAtt': ['WebUICloudFrontDistributionCFDistribution7213B062', 'DomainName']
          },
          HostedZoneId: {
            'Fn::FindInMap': [
              'AWSCloudFrontPartitionHostedZoneIdMap',
              {
                Ref: 'AWS::Partition'
              },
              'zoneId'
            ]
          }
        },
        HostedZoneId: 'Z1234567HI321TESTZID'
      })
    );
    expectCDK(stack).to(
      haveResource('AWS::Route53::RecordSet', {
        Name: 'tenant3.testdomain.com.',
        Type: 'A',
        AliasTarget: {
          DNSName: {
            'Fn::GetAtt': ['WebUICloudFrontDistributionCFDistribution7213B062', 'DomainName']
          },
          HostedZoneId: {
            'Fn::FindInMap': [
              'AWSCloudFrontPartitionHostedZoneIdMap',
              {
                Ref: 'AWS::Partition'
              },
              'zoneId'
            ]
          }
        },
        HostedZoneId: 'Z1234567HI321TESTZID'
      })
    );
    expectCDK(stack).to(
      haveResource('AWS::Route53::RecordSet', {
        Name: 'tenant4.testdomain.com.',
        Type: 'A',
        AliasTarget: {
          DNSName: {
            'Fn::GetAtt': ['WebUICloudFrontDistributionCFDistribution7213B062', 'DomainName']
          },
          HostedZoneId: {
            'Fn::FindInMap': [
              'AWSCloudFrontPartitionHostedZoneIdMap',
              {
                Ref: 'AWS::Partition'
              },
              'zoneId'
            ]
          }
        },
        HostedZoneId: 'Z1234567HI321TESTZID'
      })
    );
  });
});
