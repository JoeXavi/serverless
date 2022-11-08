const AWS =  require('aws-sdk');
const s3 = new AWS.S3();

module.exports = async function uploadPictureToS3(key, body){
    const res = await s3.upload({
        Bucket: process.env.AUCTIONS_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg'
    }).promise();

    return res.Location
}