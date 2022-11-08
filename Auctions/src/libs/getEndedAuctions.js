const AWS =  require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports = async function getEndedAuctions(){
    const now = new Date();
    const params = {
        TableName: process.env.ACTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        ExpressionAttributeValues:{
            ':status':'OPEN',
            ':now':now.toISOString()
        },
        ExpressionAttributeNames:{
            '#status':'status'
        }
    }

    const res = await dynamodb.query(params).promise();
    return res.Items;
}