const closeAuction = require('../libs/closeAuction');
const getEndedAuctions = require('../libs/getEndedAuctions')
const createError = require('http-errors')

async function processAuctions(event, context){
    try{
        const auctionsToClose = await getEndedAuctions();
        const closePromises = auctionsToClose.map(auction=> closeAuction(auction))
        await Promise.all(closePromises);
        return { closed: closePromises.length };
    }catch(e){
        console.error(e);
        throw new createError.InternalServerError(e);
    }
    
    console.log(auctionsToClose);
}

exports.handler = processAuctions;