const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

const doc = {
    info: {
        version: '1.0.0',            // by default: '1.0.0'
        title: 'JEVis RevPi Rest API',              // by default: 'REST API'
        description: ''         // by default: ''
    },
    servers: [
        {
            url: 'http://127.0.0.1:3000',              // by default: 'http://localhost:3000'
            description: ''       // by default: ''
        },
        // { ... }
    ],
    tags: [                   // by default: empty Array
        {
            name: '',             // Tag name
            description: ''       // Tag description
        },
        // { ... }
    ],
    components: {
        securitySchemes: {
            basicAuth: {
                type: 'http',
                scheme: 'basic'
            }
        }
    },

};

const outputFile = './swagger-output.json'
const endpointsFiles = ['./endpoints/endpoint.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('main')           // Your project's root file
})