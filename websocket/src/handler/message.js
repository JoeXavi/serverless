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


export const handler = async (event) => {
    const { requestContext: { connectionId } } = event;

    try {
        await answerMessages(event, `Hey there: ${connectionId}`, connectionId)
        return { statusCode: 200, body: "OK" }
    } catch (e) {
        console.error(JSON.stringify(e))
        return { statusCode: 500, body: JSON.stringify(e) }
    }
}