import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const dynamoDocument = DynamoDBDocumentClient.from(dynamoClient);

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

        return { statusCode: 200, body: "OK" }
    } catch (e) {
        console.error(JSON.stringify(e))
        return { statusCode: 500, body: JSON.stringify(e) }
    }

}