import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import {App, Stack, StackProps, aws_dynamodb as dynamodb, aws_iam as iam, CfnParameter} from "aws-cdk-lib";

export class cdkStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
        super(scope, id, props);
        new CfnParameter(this, 'env', {
            type: 'String',
            description: 'Current Amplify CLI env name',
        });

        const amplifyProjectInfo = AmplifyHelpers.getProjectInfo();
        console.log(amplifyProjectInfo.envName)

        const role = new iam.Role(this, 'FuncA-Role', {
            assumedBy: new iam.AccountRootPrincipal(),
            roleName: 'FuncARole'
        });

    }
}