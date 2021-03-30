import { StackProps } from '@aws-cdk/core';
import { ICloudFrontStackParameters } from './cloud-front-stack-parameters.interface';

export interface ICloudFrontStackProps extends StackProps {
  parameters: ICloudFrontStackParameters;
}