module.exports = function (RED) {
    function LoggerNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.configuration = RED.nodes.getNode(config.configuration);

        this.on('input', function (msg, send, done) {
            try {
                const db = require('better-sqlite3')(node.configuration.path);
                db.pragma('journal_mode = WAL');


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


                const createdataTable = async ({data_table,trend_table}) => {

                    const res = await db.prepare(`
                        CREATE TABLE IF NOT EXISTS ${data_table}
                        (
                            "id"
                            INTEGER
                            PRIMARY
                            KEY,
                            "trend_id"
                            TEXT,
                            "status"
                            INTEGER,
                            "value"
                            TEXT,
                            "date_time"
                            TEXT
                        )`);
                    res.run();


                };

                const createtrendTable = async ({trend_table}) => {
                    const res = await db.prepare(`
                        CREATE TABLE IF NOT EXISTS ${trend_table}
                        (
                            "id"
                            Text
                            PRIMARY
                            KEY,
                            name   TEXT,
                            config text
                        )`);
                    res.run();

                };


                const create = async ({table, object}) => {
                    const keys = Object.keys(object).join(",");
                    const res = await db.prepare(`INSERT INTO ${table} (${keys}) VALUES (@trend_id,@status,@value,@date_time) `);


                    res.run(object);
                    if (status == 0) {
                        node.status({fill: "green", shape: "dot", text: "Last value ("+msg.payload+") written at: " + object.date_time +" with status: "+status});
                    }else {
                        node.status({fill: "yellow", shape: "dot", text: "Last value ("+msg.payload+") written at: " + object.date_time +" with status: "+status});
                    }

                };

                const updateTrend = async ({trend_table,object}) => {
                    const keys = Object.keys(object).join(",");
                    const res = await db.prepare(`REPLACE INTO ${trend_table} (${keys}) VALUES (@name,@config,@id)`);
                    res.run(object);
                };

                const deleteRows = async ({trend, table, date}) => {
                    const res = await db.prepare(`DELETE
                                             FROM ${table}
                                             WHERE trend_id = '${trend}'
                                               AND date_time < '${date}'`);
                    res.run();
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

                    try {
                        run().then(r => {
                            console.log(Date.now()+": "+"logged data : "+msg.payload)
                            db.close();
                        }).catch(reason => {
                            node.status({fill: "red", shape: "dot", text: reason})
                            console.log(reason);
                            if (reason.code !== 'SQLITE_BUSY') throw reason;
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
            try{
            if (removed) {
                const sqlite3 = require('sqlite3');
                const {promisify} = require("util");
                var db = new sqlite3.Database(node.configuration.path);
                db.configure("busyTimeout", 5000);
                const query = promisify(db.all).bind(db);

                let trendID = String(config.id);

                const deleteDataRows = async ({trend, data_table}) => {
                    const res = await db.prepare(`DELETE
                                             FROM ${data_table}
                                             WHERE trend_id = '${trend}'`);
                    res.run();
                };

                const deleteTrendRows = async ({trend, trend_table}) => {
                    const res = await db.prepare(`DELETE
                                             FROM ${trend_table}
                                             WHERE id = '${trend}'`);
                    res.run();
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
function setNow(msg) {
    if (msg.date_time == null || msg.date_time == "undefined") {
        return new Date();
    } else {
        return new Date(msg.date_time)
    }
}