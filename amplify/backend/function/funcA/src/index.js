/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const sqs = new aws_sdk_1.SQS();
/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const handler = (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    for (const record of event.Records) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
    }
    const queueUrl = '';
    try {
        sqs.sendMessage({
            QueueUrl: queueUrl,
            MessageBody: "",
            MessageAttributes: {
                AttributeNameHere: {
                    StringValue: 'Attribute Value Here',
                    DataType: 'String',
                },
            },
        }).promise();
    }
    catch (error) {
        console.log(error);
    }
    return Promise.resolve('Successfully processed DynamoDB record');
};
exports.handler = handler;
