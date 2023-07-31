// const sqlite3 = require('./database/db-access');

let status = 0;

msg = {};
msg.error = false;
msg.payload = 13;
msg.config ="tada"

config = {};
config.logsize = 60;
config.name = "test";

node = {};
node.configuration = {};
node.configuration.trend_table = "trend";
node.configuration.data_table = "data";
node.configuration.path = "mydb.db";
 msg.topic = ["82c115a41f84126a"];

if (msg.error === false) {
    status = 0;
}
if (msg.error === true) {
    status = 16;
}
name = config.name
if (msg.payload == null || msg.payload == "undefined") {
    status = 16;
}

  // gg = sqlite.requestTrends({trend_table:"trend"}).then(value => {
  //     console.log(value)
  // })


const port = 3000;
const path = require("path");
const logger = require("morgan");

const cookieParser = require("cookie-parser");
const { initialize } = require("express-openapi");
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./api/swagger-output.json')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
var ip = require("ip");
const sqlite3 = require('./database/db-access');

urls = [];
Object.keys(require('os').networkInterfaces()).forEach(value => {
    console.log(value)
    urls.push({url:"http://"+ip.address(value)+":3000",description:value})
})
swaggerFile.servers = urls
app.use(bodyParser.json())
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))



app.listen(3000, () => {
    console.log("Server is running!\nAPI documentation: http://localhost:3000/doc")
})

const sqlite = new sqlite3("mydb.db");
/* Endpoints */
require('./api/endpoints/endpoint')(app,node.configuration,sqlite3,)

console.log(msg);

let trendID = String(config.id);
let now = new Date();
let deleteDate = new Date();

deleteDate.setDate(deleteDate.getDate() - config.logsize);

const newData = {
    trend_id: String(trendID),
    status: status,
    value: msg.payload,
    date_time: generateDatabaseDateTime(now)
};
const updatedTrend = {
    name: config.name,
    config: msg.config,
    id: trendID
};

let listTrendIds = "";
if (msg.topic !== "trends") {
    if (typeof msg.topic !== "string") {

        msg.topic.forEach((element) => {
            if (listTrendIds !== "") {
                listTrendIds += ",";
            }
            listTrendIds += "'";
            listTrendIds += element;
            listTrendIds += "'";

        });
    } else {
        listTrendIds += "'";
        listTrendIds += msg.topic;
        listTrendIds += "'";
    }
}


let limit = 1000;





const run = async () => {
    //create table if not exited
    await sqlite.createtrendTable({trend_table: node.configuration.trend_table});

    await sqlite.createdataTable({trend_table:node.configuration.trend_table,data_table:node.configuration.data_table})
    //insert row into table
    await sqlite.createDataEntry({table: node.configuration.data_table, object: newData});

    await sqlite.updateTrend({trend_table:node.configuration.trend_table,object:updatedTrend})
    //await countRows({table:"logger",trend:trendID});
    //delete rows below delete date
    await sqlite.deleteRows({
        trend: trendID,
        table: node.configuration.data_table,
        date: generateDatabaseDateTime(deleteDate)
    });
    //await query(createTableQuery);
};
try {
    run().then(r => {
        console.log(Date.now()+": "+"logged data : "+msg.payload)
        sqlite.closeDB();
    }).catch(reason => {
        //node.status({fill: "red", shape: "dot", text: reason})
        console.log(reason);
        if (reason.code !== 'SQLITE_BUSY') throw reason;
    });
} catch (err) {
    //node.status({fill: "red", shape: "dot", text: err})
    if (err.code !== 'SQLITE_BUSY') throw err;
}

function generateDatabaseDateTime(date) {

    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1,2)}-${pad(date.getUTCDate(),2)} ${pad(date.getUTCHours(),2)}:${pad(date.getUTCMinutes(),2)}:${pad(date.getUTCSeconds(),2)}`;
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}