module.exports = {
    properties: {
        body: {
            type: 'object',
            properties: {
                amount: {
                    type: "number"
                },
            },
            required: ["amount"],
        }
    },
    required: [
        'body'
    ]
}