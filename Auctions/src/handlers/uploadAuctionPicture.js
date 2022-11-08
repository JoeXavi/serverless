const { getAuctionByID }=  require('./getAuction'); 
const middy = require('@middy/core');
const validator = require('@middy/validator');
const httpErrorHandler = require('@middy/http-error-handler');
const createError = require('http-errors')
const uploadPictureToS3 = require('../libs/uploadPictureToS3');
const AWS =  require('aws-sdk');
const uploadAuctionPictureSchema = require('../libs/schemas/uploadAuctionPictureSchema');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.ACTIONS_TABLE_NAME;

const upload = async (event)=>{

    const { id } = event.pathParameters;
    const auction = await getAuctionByID(id);
    const base64 = event.body.replace(/^data:image\/\w+;base64,/,'')
    const buffer = Buffer.from(base64,'base64');

    const { email } = event.requestContext.authorizer;
    if(email !== auction.seller){
        throw new createError.Forbidden("You cannot set picture if it is not your own auction!");
    }

    try{
        const uploadPictureToS3Res = await uploadPictureToS3(auction.id+'.jpg', buffer);
        const params = {
            TableName: tableName,
            Key: { id },
            UpdateExpression: "set pictureUrl = :pictureUrl",
            ExpressionAttributeValues: {
                ":pictureUrl":uploadPictureToS3Res,
            },
            ReturnValues: 'ALL_NEW'
          }
        const res = await dynamodb.update(params).promise();
        auctionUpdated = res.Attributes;
        return {
            statusCode: 200,
            body: JSON.stringify(auctionUpdated)
        }
    }catch(e){
        throw new createError.InternalServerError(e)
    }
}

exports.handler = middy(upload)
    .use(httpErrorHandler())
    .use(validator({ inputSchema: uploadAuctionPictureSchema, ajvOptions: {
        strict: false,
      } }));
