const sqlite3 = require("./database/db-access");
const pino = require('pino');


module.exports = function (RED) {
    function LoggerNode(config) {
        RED.nodes.createNode(this, config);
        const  node = this;
        node.configuration = RED.nodes.getNode(config.configuration,node);

        function getConfig(config) {
            if (config == undefined || config == "undefined" || config == null) {
                return "asynchronous";
            }
            return config;
        }

        this.on('input', function (msg, send, done) {
            console.log(config.id +":"+process.memoryUsage())
            try {
                let status = 0;
                if (msg.error === false) {
                    status = 0;
                }
                if (msg.error === true) {
                    status = 16;
                }
                name = config.name
                if (msg.payload == undefined || msg.payload == "undefined") {
                    status = 16;
                    node.error("Payload is: " + msg.payload);
                }

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
                if (status == 0) {

                    node.status({fill: "green", shape: "dot", text: "Last value ("+newData.value+") written at: " + newData.date_time +" with status: "+newData.status});
                }else {
                    node.status({fill: "yellow", shape: "dot", text: "Last value ("+newData.value+") written at: " + newData.date_time +" with status: "+newData.status});
                }
                node.send({topic:"Create Sample",payload:newData});
                const updatedTrend = {
                    name: config.name,
                    config: getConfig(msg.config),
                    id: trendID
                };

                node.send({topic:"Update Trend",payload:updatedTrend});

                const deleteSamples = {
                    deleteDate: deleteDate,
                    id: trendID
                };
                node.send({topic:"Delete Samples",payload:deleteSamples})
                done();
            } catch (e) {
                node.status({fill: "red", shape: "dot", text: e})
                node.error(e);
                done(e);
            }
            console.log(config.id +":"+process.memoryUsage())


        });
        this.on('close', function (removed, done) {
            try {
                if (removed) {

                    node.send({topic:"Delete Trend", payload:config.id});

                } else {

                }
            } catch (e) {
                node.error(e);
                done(e);
            }finally {
                done();
            }
        });
    }
    function generateDatabaseDateTime(date) {
        if (date == undefined) {
            return undefined;
        }
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)} ${pad(date.getUTCHours(), 2)}:${pad(date.getUTCMinutes(), 2)}:${pad(date.getUTCSeconds(), 2)}`;
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

    RED.nodes.registerType("logger", LoggerNode);
}