//module.exports.getAccountId = async (context) => {
 //   return context.providers.aws.getAccountId();
//};

module.exports = async (context) => {
    return {
        account: context.providers.aws.getAccountId()
    };//
};