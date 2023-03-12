import { DynamoDBStreamEvent } from 'aws-lambda';
import { SQS } from 'aws-sdk';

const sqs = new SQS();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler = (event: DynamoDBStreamEvent) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    for (const record of event.Records) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
    }
    const queueUrl: string = ''
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
    } catch (error) {
        console.log(error);
    }

    return Promise.resolve('Successfully processed DynamoDB record');
};
