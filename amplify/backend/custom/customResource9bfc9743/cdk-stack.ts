import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import {
    Fn,
    Stack,
    StackProps,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    CfnParameter,
    aws_appsync as appSync,
    aws_lambda as lambda,
    aws_sqs as sqs,
    aws_ssm as ssm,
    aws_lambda_event_sources as eventSource, RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnGraphQLApi } from 'aws-cdk-lib/aws-appsync';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { CfnRole } from 'aws-cdk-lib/aws-iam';

export class cdkStack extends Stack {

    private baseInfo = {
        envName: 'dev',
        projectName: 'backend',
        appid: '',
        account: '301648574984',
        region: 'ap-northeast-1',
        map: {},
    };

    constructor(scope: Construct, id: string, props?: StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
        super(scope, id, props);
        const env = new CfnParameter(this, 'env', {
            type: 'String',
            description: 'Current Amplify CLI env name',
        });
        console.log(env.valueAsString);

        const amplifyProjectInfo = AmplifyHelpers.getProjectInfo();
        this.baseInfo.envName = amplifyProjectInfo.envName;
        this.baseInfo.projectName = amplifyProjectInfo.projectName;

        console.log(amplifyProjectInfo.projectName);
        console.log(amplifyProjectInfo.envName);

        const itemsGraphQLApi = new CfnGraphQLApi(this, 'backend-dev', {
            name: 'backend-dev',
            authenticationType: 'API_KEY',
        });
        console.log('itemsGraphQLApi---------', itemsGraphQLApi.attrApiId, itemsGraphQLApi.attrArn);
        this.baseInfo.appid = itemsGraphQLApi.attrApiId;

        const postTable = dynamodb.Table.fromTableAttributes(this, 'Post', {
            tableName: 'Post',
        });
        const tableStreamArn = this.resolve(postTable.tableStreamArn);
        console.log('tableStreamArn', tableStreamArn);

        this.setSQS();
        // const tableName = 'Post';
        // const postTable = dynamodb.Table.fromTableAttributes(this, 'Post', {
        //     tableName: 'Post',
        //     tableStreamArn: `arn:aws:dynamodb:ap-northeast-1:301648574984:table/${tableName}-${itemsGraphQLApi.attrApiId}-${amplifyProjectInfo.envName}/stream/2022-03-11T08:30:00.000`,
        // });
        //
        // console.log('funcA---------', funcA.functionName, funcA.functionArn);
        // console.log('postTable---------', postTable.tableName, postTable.tableArn, postTable.tableStreamArn);
        //
        // postTable.grantReadData(funcA);
        // postTable.grantStreamRead(funcA);
        // funcA.addEventSource(new eventSource.DynamoEventSource(postTable, {
        //     startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        // }));

    }

    private getFun(funcName: string) {
        if (this.baseInfo.map[funcName]) {
            return this.baseInfo.map[funcName];
        }
        const arn = `arn:aws:lambda:${this.baseInfo.region}:${this.baseInfo.account}:function:${funcName}-${this.baseInfo.envName}`;
        const func = lambda.Function.fromFunctionArn(this, `${funcName}`, arn);

        const cfnParameter = new CfnParameter(this, '${funcName}LambdaExecutionRoleParameter', {
            type: 'String',
        });

        const funcRole = iam.Role.fromRoleArn(
            this,
            `${this.baseInfo.projectName}${funcName}LambdaRole${this.baseInfo.envName}`,
            Fn.join(':', [
                'arn',
                'aws',
                'iam',
                '',
                this.baseInfo.account,
                `role/${cfnParameter.valueAsString}`,
            ]),
        );

        this.baseInfo.map[funcName] = {
            func: func,
            role: funcRole,
        };
        return this.baseInfo.map[funcName];
    }

    private getTableArn(tableName: string) {
        return `arn:aws:dynamodb:${this.baseInfo.region}:${this.baseInfo.account}:table/${tableName}-${this.baseInfo.appid}-${this.baseInfo.envName}`;
    }

    private setSQS() {
        const info = this.getFun('funcA');

        const queueName = `${this.baseInfo.projectName}-dynamoDB-cu-${this.baseInfo.envName}.fifo`;
        const queue = new sqs.Queue(this, 'sqs', {
            queueName: queueName,
            fifo: true,
        });
        queue.grantSendMessages(info.role);
        const ssmKey = new ssm.StringParameter(this, 'sqs-name', {
            dataType: ssm.ParameterDataType.TEXT,
            stringValue: queueName,
            parameterName: `/${this.baseInfo.projectName}/${this.baseInfo.envName}/queue/type1`,
        });
        ssmKey.grantRead(info.role);
    }
}