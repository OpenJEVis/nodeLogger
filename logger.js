const sqlite3 = require("./database/db-access");
module.exports = function (RED) {
    function LoggerNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.configuration = RED.nodes.getNode(config.configuration);

        this.on('input', function (msg, send, done) {
            try {
                const sqlite3 = require('./database/db-access');
                const sqlite = new sqlite3(node.configuration.path);


                let status = 0;
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


                console.log(msg);

                let trendID = String(config.id);
                let now;
                now = setNow(msg);
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







                const run = async () => {


                    await sqlite.createdataTable(node.configuration.trend_table);

                    await sqlite.createdataTable({trend_table:node.configuration.trend_table,data_table:node.configuration.data_table})

                    node.status(await sqlite.createDataEntry({table: node.configuration.data_table, object: newData}));

                    await sqlite.updateTrend({trend_table:node.configuration.trend_table,object:updatedTrend})

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
                        }).catch(reason => {
                            node.status({fill: "red", shape: "dot", text: reason})
                            console.log(reason);
                            if (reason.code !== 'SQLITE_BUSY') throw reason;
                        }).finally(() => {
                            sqlite.closeDB;
                        });
                    } catch (err) {
                        node.status({fill: "red", shape: "dot", text: err})
                        if (err.code !== 'SQLITE_BUSY') throw err;
                    }



            } catch (e) {
                node.status({fill: "red", shape: "dot", text: e})
                console.log(e);
                done(e);
            }


        });
        this.on('close', function(removed, done) {
            const sqlite3 = require('./database/db-access');
            const sqlite = new sqlite3(node.configuration.path);
            try{
            if (removed) {


                let trendID = String(config.id);





                const run = async () => {

                    await sqlite.deleteDataRows({data_table:node.configuration.data_table,trend:trendID})
                    await sqlite.deleteTrendRows({trend_table:node.configuration.trend_table,trend:trendID})
                }

                run().then(r => {

                    done();
                }).catch(reason => {
                    console.log(reason);
                    sqlite.closeDB;
                });



            } else {
                const express = require('express')
                const app = express();
                app.get('/gg', (req, res) => {
                    return res.send('Received a GET HTTP method');
                });

                app.listen(8000, () =>
                    console.log(`Example app listening on port ${process.env.PORT}!`),
                );
            }
            }catch (e){
                console.log(e);
                sqlite.db.close();
                done(e);
            }
            done();
        });
    }

    RED.nodes.registerType("logger", LoggerNode);
}

function generateDatabaseDateTime(date) {

    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1,2)}-${pad(date.getUTCDate(),2)} ${pad(date.getUTCHours(),2)}:${pad(date.getUTCMinutes(),2)}:${pad(date.getUTCSeconds(),2)}`;
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}
function setNow(msg) {
    if (msg.date_time == null || msg.date_time == "undefined") {
        return new Date();
    } else {
        return new Date(msg.date_time)
    }
}