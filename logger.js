const sqlite3 = require("sqlite3");
const {promisify} = require("util");
module.exports = function (RED) {


    /*
    Authentication node functions
    */
    function LoggerNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.configuration = RED.nodes.getNode(config.configuration);

        this.on('input', function (msg, send, done) {
            try {
                const sqlite3 = require('sqlite3');
                const {promisify} = require("util");
                var db = new sqlite3.Database(node.configuration.path);
                db.configure("busyTimeout", 5000);
                const query = promisify(db.all).bind(db);
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


                const createdataTable = async ({data_table,trend_table}) => {
                    const res = await query(`
                        CREATE TABLE IF NOT EXISTS ${data_table}
                        (
                            "id"
                            INTEGER
                            PRIMARY
                            KEY,
                            "trend_id"
                            TEXT  constraint trend_id  references ${trend_table},
                            "status"
                            INTEGER,
                            "value"
                            TEXT,
                            "date_time"
                            TEXT
                        )`);
                    return res;

                };

                const createtrendTable = async ({trend_table}) => {
                    const res = await query(`
                        CREATE TABLE IF NOT EXISTS ${trend_table}
                        (
                            "id"
                            Text
                            PRIMARY
                            KEY,
                            name   TEXT,
                            config text
                        )`);
                    return res;

                };


                const create = async ({table, object}) => {
                    const keys = Object.keys(object).join(",");
                    const values = Object.values(object)
                        .map((v) => `"${v}"`)
                        .join(",");

                    const res = await query(`INSERT INTO ${table} (${keys})
                                             VALUES (${values})`);

                    if (status == 0) {
                        node.status({fill: "green", shape: "dot", text: "Last value ("+msg.payload+") written at: " + object.date_time +" with status: "+status});
                    }else {
                        node.status({fill: "yellow", shape: "dot", text: "Last value ("+msg.payload+") written at: " + object.date_time +" with status: "+status});
                    }

                    return res;
                };

                const updateTrend = async ({trend_table,object}) => {
                    const keys = Object.keys(object).join(",");
                    const values = Object.values(object)
                        .map((v) => `"${v}"`)
                        .join(",");

                    const res = await query(`REPLACE INTO ${trend_table} (${keys})
                    VALUES (${values})`);
                    return res;
                };

                const deleteRows = async ({trend, table, date}) => {
                    const res = await query(`DELETE
                                             FROM ${table}
                                             WHERE trend_id = '${trend}'
                                               AND date_time < '${date}'`);
                    return res;
                };
                const run = async () => {
                    //create table if not exited
                    await createtrendTable({trend_table: node.configuration.trend_table});

                    await createdataTable({trend_table:node.configuration.trend_table,data_table:node.configuration.data_table})
                    //insert row into table
                    await create({table: node.configuration.data_table, object: newData});

                    await updateTrend({trend_table:node.configuration.trend_table,object:updatedTrend})
                    //await countRows({table:"logger",trend:trendID});
                    //delete rows below delete date
                    await deleteRows({
                        trend: trendID,
                        table: node.configuration.data_table,
                        date: generateDatabaseDateTime(deleteDate)
                    });
                    //await query(createTableQuery);
                };
                run().then(r => {
                    console.log(Date.now()+": "+"logged data : "+msg.payload)
                    db.close();
                    done();
                }).catch(reason => {
                    node.status({fill: "red", shape: "dot", text: reason})
                    console.log(reason);
                    done(reason);
                });
            } catch (e) {
                node.status({fill: "red", shape: "dot", text: e})
                console.log(e);
                done(e);
            }


        });
        this.on('close', function(removed, done) {
            try{
            if (removed) {
                const sqlite3 = require('sqlite3');
                const {promisify} = require("util");
                var db = new sqlite3.Database(node.configuration.path);
                db.configure("busyTimeout", 5000);
                const query = promisify(db.all).bind(db);

                let trendID = String(config.id);

                const deleteDataRows = async ({trend, data_table}) => {
                    const res = await query(`DELETE
                                             FROM ${data_table}
                                             WHERE trend_id = '${trend}'`);
                    return res;
                };

                const deleteTrendRows = async ({trend, trend_table}) => {
                    const res = await query(`DELETE
                                             FROM ${trend_table}
                                             WHERE id = '${trend}'`);
                    return res;
                };

                const run = async () => {

                    await deleteDataRows({data_table:node.configuration.data_table,trend:trendID})
                    await deleteTrendRows({trend_table:node.configuration.trend_table,trend:trendID})
                }

                run().then(r => {
                    db.close();
                    done();
                });



            } else {
                // This node is being restarted
            }
            }catch (e){
                console.log(e);
                db.close();
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