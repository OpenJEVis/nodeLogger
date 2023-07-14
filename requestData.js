const sqlite3 = require("sqlite3");
const {promisify} = require("util");
module.exports = function (RED) {

    function RequestNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.configuration = RED.nodes.getNode(config.configuration);
        if (node.configuration) {
        } else {

        }
        this.on('input', function (msg, send, done) {


            try {
                const sqlite3 = require('sqlite3');
                const {promisify} = require("util");
                var db = new sqlite3.Database(node.configuration.path);
                const query = promisify(db.all).bind(db);

                db.configure("busyTimeout", 2000);

                console.log(typeof msg.topic)
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
                let until;
                if (msg.payload.until != "undefined" && msg.payload.until != null) {
                     until = new Date(msg.payload.until);
                }else {
                    until = new Date();
                }
                let limit;
                if (msg.payload.limit != "undefined" && msg.payload.limit != null) {
                    limit = msg.payload.limit
                }else{
                    limit = 1000;
                }
                let from = new Date(msg.payload.from);

                const createdataTable = async ({date_table,trend_table}) => {
                    const res = await query(`
                        CREATE TABLE IF NOT EXISTS ${date_table}
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
                const requestData = async ({trend, data_table, trend_table, from,until,limit}) => {
                    let queryString;
                    if ((msg.payload.from == null || msg.payload.from == "undefined") && (msg.payload.until == null || msg.payload.until == "undefined")) {
                        queryString =(`SELECT D.id, D.trend_id, D.value, D.date_time, D.status, T.name, T.config  FROM ${data_table}  as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend}) ORDER BY D.id DESC
                                            LIMIT '${limit}' `);
                    }else {
                        queryString =(`SELECT D.id, D.trend_id, D.value, D.date_time, D.status, T.name, T.config  FROM ${data_table} as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend})
                                            AND date_time BETWEEN '${from}' AND '${until}' ORDER BY D.id DESC LIMIT '${limit}' `);
                    }

                    console.log(queryString);
                    const res = await query(queryString);


                    return res;
                };
                const requestTrends = async ({trend_table}) => {
                    const res = await query(`SELECT DISTINCT * FROM ${trend_table}`)
                    return res;
                };
                const run = async () => {
                    //create table if not exited
                    await createtrendTable({trend_table:node.configuration.trend_table})

                    await createdataTable({date_table:node.configuration.data_table,trend_table:node.configuration.trend_table});
                    if (msg.topic === "trends") {
                        result = await requestTrends({trend_table:node.configuration.trend_table})
                        return result;
                    }else {
                        result = await requestData({trend:listTrendIds,from:generateDatabaseDateTime(from),until:generateDatabaseDateTime(until),data_table:node.configuration.data_table,trend_table:node.configuration.trend_table,limit});
                        return result;
                    }
                };
                run().then(r => {
                    if (r.length == 0)  node.status({fill: "yellow", shape: "dot", text: "No Data Available for this Time Intervall"});
                    else node.status({fill: "green", shape: "dot", text: r.length+" Data Samples Received"});
                    db.close()
                    msg.payload = r;
                    node.send(msg);
                }).catch(reason => {
                    node.status({fill: "red", shape: "dot", text: reason})
                    console.log(reason);
                    done(reason)
                });


            } catch (e) {
                node.status({fill: "red", shape: "dot", text: e})
                console.log(e);
                done(e)
            }


        });
    }

    RED.nodes.registerType("requestData", RequestNode);
}

function generateDatabaseDateTime(date) {

    return `${date.getFullYear()}-${pad(date.getMonth()+1,2)}-${pad(date.getDate(),2)} ${pad(date.getHours(),2)}:${pad(date.getMinutes(),2)}:${pad(date.getSeconds(),2)}`;
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}