const ip = require("ip");
const swaggerFile = require("./api/swagger-output.json");
module.exports = function(RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this,config);
        let node = this;
        node.configuration = RED.nodes.getNode(config.configuration);
        node.credentials = this.credentials
        node.port = config.port;

        node.on('input', function(msg) {


            console.log(node)
            const logger = require("morgan");

            const cookieParser = require("cookie-parser");
            const { initialize } = require("express-openapi");
            const swaggerUi = require('swagger-ui-express');
            const swaggerFile = require('./api/swagger-output.json');
            const bodyParser = require('body-parser');
            const express = require('express');
            const app = express();
            const basicAuth = require('express-basic-auth');

            urls = [];
            Object.keys(require('os').networkInterfaces()).forEach(value => {
                console.log(value)
                urls.push({url:"http://"+ip.address(value)+":3000",description:value})
            })
            swaggerFile.servers = urls
            app.use(bodyParser.json())
            app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))


            app.listen(node.port, () => {
                console.log("Server is running! at port "+node.port)
                console.log("Server is running!\nAPI documentation: http://localhost:3000/doc")
                node.status({fill: "green", shape: "dot", text: "Server Startet at port: "+node.port})
            })



            /* Endpoints */
            require('./api/endpoints/endpoint')(app,node.configuration,require('./database/db-access'),node.credentials)


            //msg.payload = msg.payload.toLowerCase();
            //node.send(msg);



        });
    }
    RED.nodes.registerType("api",LowerCaseNode,{
        credentials: {
            username: {type:"text"},
            password: {type:"password"}
        }
    });
}