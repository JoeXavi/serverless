const AWS =  require('aws-sdk');
const mhandler = require('../libs/middyMiddleware')
const createError = require('http-errors')
const validator = require('@middy/validator');
const getAuctionsSchema = require('../libs/schemas/getAuctionsSchema');

const tableName = process.env.ACTIONS_TABLE_NAME;

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let auctions;
  const params = {
    TableName: process.env.ACTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues:{
        ':status':status,
    },
    ExpressionAttributeNames:{
        '#status':'status'
    }
}
  try{
    //const res = await dynamodb.scan({
    //    TableName: tableName
    //}).promise();
    const res = await dynamodb.query(params).promise();
    auctions = res.Items;
  }catch(e){
    console.error(e);
    throw new createError.InternalServerError(e)
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

exports.handler = mhandler(getAuctions)
  .use(validator({ inputSchema: getAuctionsSchema, ajvOptions: {
    useDefaults: true,
    strict: false,
  } }));


