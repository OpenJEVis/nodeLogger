const ip = require("ip");
const swaggerFile = require("./api/swagger-output.json");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const pino = require('pino');
const sqlite3 = require("./database/db-access");
module.exports = function (RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.configuration = RED.nodes.getNode(config.configuration);
        node.credentials = this.credentials;
        node.port = config.port;
        let server;

        node.on('input', function (msg, send, done) {

            const cookieParser = require("cookie-parser");
            const {initialize} = require("express-openapi");
            const swaggerUi = require('swagger-ui-express');
            const swaggerFile = require('./api/swagger-output.json');
            const bodyParser = require('body-parser');
            const express = require('express');
            const app = express();
            const basicAuth = require('express-basic-auth');
            try{
                if (msg.payload == "STOP") {
                    server.close();
                    node.status({fill: "red", shape: "dot", text: "Server Stopped"});
                } else if (msg.payload == "START") {
                    try {
                        server.close();
                        node.status({fill: "red", shape: "dot", text: "Server Stopped"});
                    } catch (e){
                        node.error(e);
                        done(e);
                    }
                    urls = [];
                    Object.keys(require('os').networkInterfaces()).forEach(value => {
                       node.debug(value);
                        urls.push({url: "http://" + ip.address(value) + ":3000", description: value});
                    });
                    swaggerFile.servers = urls;
                    app.use(bodyParser.json());
                    app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));


                    server = app.listen(node.port, () => {
                        node.log("Server is running! at port: "+node.port)
                        node.status({fill: "green", shape: "dot", text: "Server Startet at port: " + node.port});
                    }).on('error',(err)=>{
                        node.error(err);
                        node.status({fill: "yellow", shape: "dot", text: err})
                        done(err)
                    });


                    const sqlite3 = require('./database/db-access');
                    const sqlite = new sqlite3(node.configuration.path,node);

                    /* Endpoints */
                    require('./api/endpoints/endpoint')(app, node.configuration, sqlite, node.credentials);
                }
            }catch (e){
                node.error(e);
                node.status({fill: "red", shape: "dot", text: e});
                done(e);
            }



            //msg.payload = msg.payload.toLowerCase();
            //node.send(msg);


        });
    }

    RED.nodes.registerType("Rest-Server", LowerCaseNode, {
        credentials: {
            username: {type: "text"},
            password: {type: "password"}
        }
    });
}