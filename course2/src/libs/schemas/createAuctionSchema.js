/*module.exports = {
    type: "object",
    required: ['body', 'title'],
    properties: {
      body: {
        type: 'object'
      },
      title: {
        type: 'string'
      }
    }
}*/

module.exports = {
    properties: {
        body: {
            type: 'object',
            properties: {
                title: {
                    type: "string"
                },
            },
            required: ["title"],
        }
    },
    required: [
        'body'
    ]
}