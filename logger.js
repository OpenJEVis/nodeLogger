const sqlite3 = require("./database/db-access");
const pino = require('pino');


module.exports = function (RED) {
    function LoggerNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.configuration = RED.nodes.getNode(config.configuration,node);

        this.on('input', function (msg, send, done) {
            try {
                const sqlite3 = require('./database/db-access');
                const sqlite = new sqlite3(node.configuration.path,node);


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

                let trendID = String(config.id);
                let now;
                now = sqlite.setNow(msg);
                let deleteDate = new Date();

                deleteDate.setDate(deleteDate.getDate() - config.logsize);

                const newData = {
                    trend_id: String(trendID),
                    status: status,
                    value: msg.payload,
                    date_time: sqlite.generateDatabaseDateTime(now)
                };
                const updatedTrend = {
                    name: config.name,
                    config: msg.config,
                    id: trendID
                };


                const run = async () => {


                    await sqlite.createdataTable(node.configuration.trend_table);

                    await sqlite.createdataTable({
                        trend_table: node.configuration.trend_table,
                        data_table: node.configuration.data_table
                    })

                    node.status(await sqlite.createDataEntry({table: node.configuration.data_table, object: newData}));

                    await sqlite.updateTrend({trend_table: node.configuration.trend_table, object: updatedTrend})

                    await sqlite.deleteRows({
                        trend: trendID,
                        table: node.configuration.data_table,
                        date: sqlite.generateDatabaseDateTime(deleteDate)
                    });
                    //await query(createTableQuery);
                };

                try {
                    run().then(r => {
                        node.debug(Date.now() + ": " + "logged data : " + msg.payload)
                    }).catch(reason => {
                        node.status({fill: "red", shape: "dot", text: reason})
                        node.error(reason);
                        done(reason);
                    }).finally(() => {
                        sqlite.closeDB;
                    });
                } catch (err) {
                    node.error(err);
                    node.status({fill: "red", shape: "dot", text: err});
                    done(err);
                }


            } catch (e) {
                node.status({fill: "red", shape: "dot", text: e})
                node.error(e);
                done(e);
            }


        });
        this.on('close', function (removed, done) {
            const sqlite3 = require('./database/db-access');
            const sqlite = new sqlite3(node.configuration.path);
            try {
                if (removed) {


                    let trendID = String(config.id);


                    const run = async () => {

                        await sqlite.deleteDataRows({data_table: node.configuration.data_table, trend: trendID})
                        await sqlite.deleteTrendRows({trend_table: node.configuration.trend_table, trend: trendID})
                    }

                    run().then(r => {
                    }).catch(reason => {
                        node.error(reason);
                        done(reason);
                    }).finally(() => {
                        sqlite.closeDB;
                    });


                } else {

                }
            } catch (e) {
                node.error(e);
                done(e)
            }finally {
                sqlite.closeDB;
            }
        });
    }

    RED.nodes.registerType("logger", LoggerNode);
}