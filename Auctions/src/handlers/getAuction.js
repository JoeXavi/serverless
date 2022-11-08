const AWS =  require('aws-sdk');
const mhandler = require('../libs/middyMiddleware');
const createError = require('http-errors')

const tableName = process.env.ACTIONS_TABLE_NAME;

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctionByID(id){
  let auction;
  try{
    const res = await dynamodb.get({
        TableName: tableName,
        Key: { id }
    }).promise();

    auction = res.Item;
  }catch(e){
    console.error(e);
    throw new createError.InternalServerError(e)
  }

  if(!auction){
    throw new createError.NotFound(`Auction with ID "${id}" not found!`)
  }

  return auction;
}

async function getAuction(event, context) {

  const { id } = event.pathParameters;
  
  let auction = await getAuctionByID(id);
  
  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

const handler = mhandler(getAuction);
module.exports = {
  handler,
  getAuctionByID
}

