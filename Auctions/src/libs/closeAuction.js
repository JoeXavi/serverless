const AWS =  require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

module.exports = async function closeAuction(auction){
   
    const params = {
        TableName: process.env.ACTIONS_TABLE_NAME,
        Key: { id: auction.id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues:{
            ':status':'CLOSED',
        },
        ExpressionAttributeNames:{
            '#status':'status'
        }
    }

    const res = dynamodb.update(params).promise();
    const { title, seller, bidder, highestBid } = auction;

    if(highestBid.amount === 0){
        const notifySeller = await sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: 'No bids on your auction item :(!',
                recipient: seller,
                body: 'Oh no! your item '+title+' did not get any bids. Better luck next time!'
            })
        }).promise();
        return;
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'Your items has been sold!',
            recipient: seller,
            body: 'Excelent! your item '+title+' has been sold for '+highestBid.amount
        })
    }).promise()

    const notifyBitter = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'You won an auction!',
            recipient: bidder,
            body: 'What a great deal! You got yourself a '+title+' for '+highestBid.amount
        })
    }).promise()
    

    return Promise.all([notifyBitter, notifySeller]);
}