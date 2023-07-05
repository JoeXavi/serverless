import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const dynamoDocument = DynamoDBDocumentClient.from(dynamoClient);

import {
        ApiGatewayManagementApiClient,
        PostToConnectionCommand
 } from "@aws-sdk/client-apigatewaymanagementapi"

const answerMessages = async(event, message, connectionId)=>{
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    const callbackUrl = `https://${domain}/${stage}`;
    const client = new ApiGatewayManagementApiClient({
        region: "us-east-1",
        apiVersion: "2018-11-29",
        endpoint: callbackUrl
    });
    const requestParams = {
        ConnectionId: connectionId,
        Data: message,
    };

    const command = new PostToConnectionCommand(requestParams);
    await client.send(command);
    return true
}


export const handler = async (event, context) => {
    const { body, requestContext: { connectionId, routeKey } } = event;

    const tableName = process.env.TABLENAME
    try {
        if (routeKey === "$connect") {
            await dynamoDocument.send(
                new PutCommand({
                    TableName: tableName,
                    Item: {
                        id: connectionId
                    }
                })
            );
        }

        if (routeKey === "$disconnect") {
            await dynamoDocument.send(
                new DeleteCommand({
                    TableName: tableName,
                    Key: {
                        id: connectionId
                    },
                })
            );
        }

        if (routeKey === "message") {
            await answerMessages(event, "hey there", connectionId)
        }

        return { statusCode: 200, body: "OK" }
    } catch (e) {
        console.error(JSON.stringify(e))
        return { statusCode: 500, body: JSON.stringify(e) }
    }

}