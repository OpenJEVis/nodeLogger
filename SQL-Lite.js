const sqlite3 = require("./database/db-access");
module.exports = function (RED) {
    function LoggerNode(config) {
        RED.nodes.createNode(this, config);
        const  node = this;
        node.configuration = RED.nodes.getNode(config.configuration,node);
        const sqlite3 = require('./database/db-access');
        const sqlite = new sqlite3(node.configuration.path,node);

        this.on('input', async function (msg, send, done) {
            node.log(JSON.stringify(msg.payload));
            try {
                const createTable = async () => {
                    await sqlite.createtrendTable(node.configuration.trend_table);

                    await sqlite.createdataTable({
                        trend_table: node.configuration.trend_table,
                        data_table: node.configuration.data_table
                    });
                }


                createTable().catch(reason => {
                    node.log(reason);
                })
                if (msg.topic == "Create Sample") {
                    await createSample({action:msg.topic,payload:msg.payload}).catch(reason => {
                        node.log(reason);
                    }).finally(() => {
                        sqlite.closeDB;
                    })
                } else if (msg.topic == "Update Trend") {
                    await updateTrend({action:msg.topic,payload:msg.payload}).catch(reason => {
                        node.log(reason);
                    }).finally(() => {
                        sqlite.closeDB;
                    })
                } else if (msg.topic == "Delete Samples") {
                    await deleteSamples({action:msg.topic,payload:msg.payload}).catch(reason => {
                        node.log(reason);
                    }).finally(() => {
                        sqlite.closeDB;
                    })
                } else if (msg.topic == "Delete Trend") {
                   await  deleteTrend({action:msg.topic,payload:msg.payload}).catch(reason => {
                        node.log(reason);
                    }).finally(() => {
                       sqlite.closeDB;
                    })
                } else if (msg.topic == "Get All Trends") {
                    result = await getAlltrends();
                    if (result != null) {
                        node.status({fill: "green", shape: "dot", text: "get Trends: " + result.length});
                    }
                    node.send({payload: result});
                }else if (msg.topic == "Get Data") {
                    node.log(msg.payload)

                    result = await getData({
                        aggregation: msg.payload.aggregation,
                        from: setFrom(msg.payload.from),
                        until: setUntil(msg.payload.until),
                        limit: setLimit(msg.payload.limit),
                        listTrendIds: getTrendList(msg.payload.trends)
                    });
                    if (result != null) {

                        node.status({fill: "green", shape: "dot", text: "get Trends: " + result.length});
                    }
                    node.send({payload: result,trends:msg.payload.trends})
                }
            } catch (e) {
                done(e);
            }
            done();
        });

        const createSample = async ({action,payload}) =>{
            node.log(action);
            node.log(payload);

            node.status(await sqlite.createDataEntry({table: node.configuration.data_table, object: payload}));
        }

        const updateTrend = async  ({action,payload}) =>{
            node.log(action + JSON.stringify(payload));
            await sqlite.updateTrend({trend_table: node.configuration.trend_table, object: payload})
        }

        const deleteSamples = async  ({action,payload})=>{
            node.log(action + JSON.stringify(payload));

            deleteDate = new Date(payload.deleteDate);
            await sqlite.deleteRows({
                trend: payload.id,
                table: node.configuration.data_table,
                date: sqlite.generateDatabaseDateTime(deleteDate),

            });
        }

        const deleteTrend = async ({action,payload}) => {
            node.log(action + payload);

            await sqlite.deleteDataRows({data_table: node.configuration.data_table, trend: payload})
            await sqlite.deleteTrendRows({trend_table: node.configuration.trend_table, trend: payload})
        }


        function getTrendList(trends){
            node.log(trends);
            let trendlist = [];
                if (typeof trends !== "string") {

                    trends.forEach((element) => {
                        // if (trendlist !== "") {
                        //     trendlist += ",";
                        // }
                        trendlist += "'";
                        trendlist += element;
                        trendlist += "'";
                        trendlist += ",";

                    });
                    trendlist = trendlist.substring(0, trendlist.length - 1);
                } else {
                    trendlist += "'";
                    trendlist += trends;
                    trendlist += "'";
                }
            node.log(trendlist);

            return trendlist;
            }

            function setUntil(date){
                if (date != "undefined" && date != null && date != undefined) {
                    let until = new Date(date);
                    return until;
                } else{
                    let until = new Date();
                    return until;
                }
        }

        function setLimit(input_limit){
            let limit;
            if (input_limit != "undefined" && input_limit != null && input_limit != undefined) {
                limit = input_limit;
            } else {
                limit = 1000;
            }

            return limit;
        }

        function setFrom (date){
            if (date != "undefined" && date != null && date != undefined) {
                let from = new Date(date);
                return from;
            } else {
               return undefined
            }

        }

        const getAlltrends = async ()=>{
            let result = await sqlite.requestTrends({trend_table: node.configuration.trend_table})
            return result;
        }
        const getData = async({aggregation,from,until,listTrendIds,limit})=>{
            node.debug("aggregation:"+aggregation)
            switch (aggregation) {
                case "NONE":
                    result = await sqlite.requestData({
                        trend: listTrendIds,
                        from: sqlite.generateDatabaseDateTime(from),
                        until: sqlite.generateDatabaseDateTime(until),
                        data_table: node.configuration.data_table,
                        trend_table: node.configuration.trend_table,
                        limit
                    });
                    return result;
                    break;
                case "SUM":
                    result = await sqlite.requestDataSum({
                        trend: listTrendIds,
                        from: sqlite.generateDatabaseDateTime(from),
                        until: sqlite.generateDatabaseDateTime(until),
                        data_table: node.configuration.data_table,
                        trend_table: node.configuration.trend_table,
                        limit
                    });
                    return result;
                    break;
                case "AVG":
                    result = await sqlite.requestDataAvg({
                        trend: listTrendIds,
                        from: sqlite.generateDatabaseDateTime(from),
                        until: sqlite.generateDatabaseDateTime(until),
                        data_table: node.configuration.data_table,
                        trend_table: node.configuration.trend_table,
                        limit
                    });
                    return result;
                    break;
                case "MIN":
                    result = await sqlite.requestDataMin({
                        trend: listTrendIds,
                        from: sqlite.generateDatabaseDateTime(from),
                        until: sqlite.generateDatabaseDateTime(until),
                        data_table: node.configuration.data_table,
                        trend_table: node.configuration.trend_table,
                        limit
                    });
                    return result;
                    break;
                case "MAX":
                    result = await sqlite.requestDataMax({
                        trend: listTrendIds,
                        from: sqlite.generateDatabaseDateTime(from),
                        until: sqlite.generateDatabaseDateTime(until),
                        data_table: node.configuration.data_table,
                        trend_table: node.configuration.trend_table,
                        limit
                    });
                    return result;
                    break;
                case "DIFF":
                    result = await sqlite.requestDataDiff({
                        trend: listTrendIds,
                        from: sqlite.generateDatabaseDateTime(from),
                        until: sqlite.generateDatabaseDateTime(until),
                        data_table: node.configuration.data_table,
                        trend_table: node.configuration.trend_table,
                        limit
                    });
                    return result;
                    break;


            }
        }
    }
    RED.nodes.registerType("SQL-Lite", LoggerNode);
}