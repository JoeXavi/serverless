const axios = require('axios');
const createError = require('http-errors');
const mhandler = require('../libs/middyMiddleware')

const testFunction = async(event, context)=>{
    try{
        const res = await axios.get('https://swapi.dev/api/');
        return {
            statusCode: 200,
            body: JSON.stringify(res.data),
        };
    }catch(e){
        console.error(e);
        throw new createError.InternalServerError(e)
    }
}

exports.handler = mhandler(testFunction);

