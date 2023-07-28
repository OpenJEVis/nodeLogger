module.exports = function (RED) {
    function RequestNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.aggregation = config.aggregation;
        node.configuration = RED.nodes.getNode(config.configuration);

        if (node.configuration) {
        } else {

        }
        this.on('input', function (msg, send, done) {


            try {
                const sqlite3 = require('./database/db-access');
                const sqlite = new sqlite3(node.configuration.path);


                let aggregation = node.aggregation;

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

                const run = async () => {
                    //create table if not exited
                    await sqlite.createtrendTable({trend_table:node.configuration.trend_table})

                    await sqlite.createdataTable({date_table:node.configuration.data_table,trend_table:node.configuration.trend_table});

                    if (msg.topic === "trends") {
                        result = await sqlite.requestTrends({trend_table:node.configuration.trend_table})
                        return result;
                    }else {
                        console.log(aggregation)

                        switch (aggregation) {
                            case "NONE":
                                result = await sqlite.requestData({trend:listTrendIds,from:generateDatabaseDateTime(from),until:generateDatabaseDateTime(until),data_table:node.configuration.data_table,trend_table:node.configuration.trend_table,limit});
                                return result;
                                break;
                            case "SUM":
                                result = await sqlite.requestDataSum({trend:listTrendIds,from:generateDatabaseDateTime(from),until:generateDatabaseDateTime(until),data_table:node.configuration.data_table,trend_table:node.configuration.trend_table,limit});
                                return result;
                                break;
                            case "AVG":
                                result = await sqlite.requestDataAvg({trend:listTrendIds,from:generateDatabaseDateTime(from),until:generateDatabaseDateTime(until),data_table:node.configuration.data_table,trend_table:node.configuration.trend_table,limit});
                                return result;
                                break;
                            case "MIN":
                                result = await sqlite.requestDataMin({trend:listTrendIds,from:generateDatabaseDateTime(from),until:generateDatabaseDateTime(until),data_table:node.configuration.data_table,trend_table:node.configuration.trend_table,limit});
                                return result;
                                break;
                            case "MAX":
                                result = await sqlite.requestDataMax({trend:listTrendIds,from:generateDatabaseDateTime(from),until:generateDatabaseDateTime(until),data_table:node.configuration.data_table,trend_table:node.configuration.trend_table,limit});
                                return result;
                                break;
                            case "DIFF":
                                result = await sqlite.requestDataDiff({trend:listTrendIds,from:generateDatabaseDateTime(from),until:generateDatabaseDateTime(until),data_table:node.configuration.data_table,trend_table:node.configuration.trend_table,limit});
                                return result;
                                break;


                        }
                    }

                };
                run().then(r => {
                    console.log(r)
                    if (r.length == 0)  node.status({fill: "yellow", shape: "dot", text: "No Data Available for this Time Intervall"});
                    else node.status({fill: "green", shape: "dot", text: r.length+" Data Samples Received"});
                    msg.payload = r;
                    node.send(msg);
                }).catch(reason => {
                    node.status({fill: "red", shape: "dot", text: reason})
                    console.log(reason);
                    done(reason)
                }).finally(() => {
                    sqlite.closeDB;
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