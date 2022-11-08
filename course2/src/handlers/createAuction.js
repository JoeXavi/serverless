const { v4 } = require ('uuid');
const uuid = v4;
const AWS =  require('aws-sdk');
const mhandler = require('../libs/middyMiddleware');
const createError = require('http-errors');
const validator = require('@middy/validator');
const createAuctionSchema = require('../libs/schemas/createAuctionSchema');

const tableName = process.env.ACTIONS_TABLE_NAME;

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const { email } = event.requestContext.authorizer;

  const now =  new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours()+1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    pictureUrl:'',
    highestBid:{
      amount: 0
    },
    seller: email,
    bidder: '',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString()
  }
  try{
    await dynamodb.put({
      TableName: tableName,
      Item: auction 
    }).promise();
  }catch(e){
    console.error(e);
    throw new createError.InternalServerError(e)
  }
  
  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

exports.handler = mhandler(createAuction).use(validator({ inputSchema: createAuctionSchema, ajvOptions: {
  strict: false,
} }));


