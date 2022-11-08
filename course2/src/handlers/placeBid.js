const AWS =  require('aws-sdk');
const mhandler = require('../libs/middyMiddleware');
const createError = require('http-errors');
const validator = require('@middy/validator');
const { getAuctionByID }=  require('./getAuction'); 
const placeBitSchema = require('../libs/schemas/placeBitSchema');


const tableName = process.env.ACTIONS_TABLE_NAME;

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {

  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction =  await getAuctionByID(id);

  if(email === auction.seller){
    throw new createError.Forbidden("You cannot bid on your own auctions!");
  }

  if(email === auction.bidder){
    throw new createError.Forbidden("You are already the highest bidder!");
  }
  if(auction.status !== 'OPEN'){
    throw new createError.Forbidden("You cannot bid on closed auctions!");
  }

  if(amount<= auction.highestBid.amount){
    throw new createError.Forbidden(`Your bit must be higher than ${auction.highestBid.amount}!`)
  }

  let auctionUpdated;
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount, bidder = :bidder",
    ExpressionAttributeValues: {
        ":amount":amount,
        ":bidder":email
    },
    ReturnValues: 'ALL_NEW'
  }

  console.log(`TheParams: ${JSON.stringify(params)}`)

  try{
    const res = await dynamodb.update(params).promise();
    auctionUpdated = res.Attributes;
  }catch(e){
    console.error(e);
    throw new createError.InternalServerError(e)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctionUpdated),
  };
}

exports.handler = mhandler(placeBid).use(validator({ inputSchema: placeBitSchema, ajvOptions: {
  strict: false,
} }));





