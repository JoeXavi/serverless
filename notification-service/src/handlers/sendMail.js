const AWS =  require('aws-sdk');
const ses = new AWS.SES({
  region: 'us-east-1'
})
async function sendMail(event, context) {
  const record = event.Records[0];
  console.log('Record processing: ',record)

  const { subject, body, recipient } = JSON.parse(record.body)

  const params = {
    Source: "info@joexavi.com",
    Destination:{
      ToAddresses: [recipient]
    },
    Message:{
      Body:{
        Text: {
          Data: body
        }
      },
      Subject:{
        Data: subject
      }
    }
  }

  try{
    const res = await ses.sendEmail(params).promise();
    console.log(res);
    return res;
  }catch(e){
    console.error(e);
  }
  return event;
}

exports.handler = sendMail;


