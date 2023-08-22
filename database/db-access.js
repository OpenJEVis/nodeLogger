class Sqlite {
    constructor(path) {
        this.path = path;
        //this.node = node;
        this.db = require('better-sqlite3')(path,  { timeout: 20000 });
        this.db.pragma('journal_mode = WAL');
    }

    createdataTable = async ({data_table}) => {


        const res = await this.db.prepare(`
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
    createtrendTable = async ({trend_table}) => {
        const res = await this.db.prepare(`
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
    createDataEntry = async ({table, object}) => {
        //this.node.log("Creates Sample: " + JSON.stringify(object));
        const keys = Object.keys(object).join(",");
        const res = await this.db.prepare(`INSERT INTO ${table} (${keys}) VALUES (@trend_id,@status,@value,@date_time) `);


        res.run(object);
        if (object.status == 0) {
            return({fill: "green", shape: "dot", text: "Last value ("+object.value+") written at: " + object.date_time +" with status: "+object.status});
        }else {
            return({fill: "yellow", shape: "dot", text: "Last value ("+object.value+") written at: " + object.date_time +" with status: "+object.status});
        }

    };

    updateTrend = async ({trend_table,object}) => {
        //this.node.log("update trend: " + JSON.stringify(object));
        const keys = Object.keys(object).join(",");
        const res = await this.db.prepare(`REPLACE INTO ${trend_table} (${keys}) VALUES (@name,@config,@id)`);
        res.run(object);
    };

    deleteRows = async ({trend, table, date}) => {
        //this.node.debug("delete old samples: " + trend + "date: " + JSON.stringify(date));
        const res = await this.db.prepare(`DELETE
                                 FROM ${table}
                                 WHERE trend_id = '${trend}'
                                   AND date_time < '${date}'`);
        res.run();
    };


    deleteTrendRows = async ({trend, trend_table}) => {
        //this.node.log("delete trend config: " + trend);
        const res = await this.db.prepare(`DELETE
                                 FROM ${trend_table}
                                 WHERE id = '${trend}'`);
        res.run();
    };

    deleteDataRows = async ({trend, data_table}) => {
        //this.node.log("delete samples trend: " + trend);
        const res = await this.db.prepare(`DELETE
                                             FROM ${data_table}
                                             WHERE trend_id = '${trend}'`);
        res.run();
    };
    requestTrends = async ({trend_table}) => {
        //this.node.log("get all trends");
        const res = await this.db.prepare(`SELECT DISTINCT * FROM ${trend_table}`)
        return res.all();
    };
    requestData = async ({trend, data_table, trend_table, from,until,limit}) => {

        let queryString;
        if (from == undefined || from == "undefined") {
            queryString =(`SELECT D.id, D.trend_id, D.value, D.date_time, D.status, T.name, T.config  FROM ${data_table}  as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend}) ORDER BY D.id DESC
                                            LIMIT '${limit}' `);
        }else {
            queryString =(`SELECT D.id, D.trend_id, D.value, D.date_time, D.status, T.name, T.config  FROM ${data_table} as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend})
                                            AND date_time BETWEEN '${from}' AND '${until}' ORDER BY D.id DESC LIMIT '${limit}' `);
        }

        //console.log(queryString);
        const res = await this.db.prepare(queryString);
        return res.all();
    };

    requestDataSum = async ({trend, data_table, trend_table, from,until,limit}) => {
       // this.node.log("get sum of: "+trend);

        let queryString;
        if (from == undefined || from == "undefined") {
            queryString =(`SELECT D.id, D.trend_id, SUM(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table}  as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend}) ORDER BY D.id DESC
                                            LIMIT '${limit}' `);
        }else {
            queryString =(`SELECT D.id, D.trend_id, SUM(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table} as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend})
                                            AND date_time BETWEEN '${from}' AND '${until}' ORDER BY D.id DESC LIMIT '${limit}' `);
        }


        const res = await this.db.prepare(queryString);
        return res.all();
    };

    requestDataAvg = async ({trend, data_table, trend_table, from,until,limit}) => {
       // this.node.log("get avg of: "+trend);

        let queryString;
        if (from == undefined || from == "undefined") {
            queryString =(`SELECT D.id, D.trend_id, AVG(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table}  as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend}) ORDER BY D.id DESC
                                            LIMIT '${limit}' `);
        }else {
            queryString =(`SELECT D.id, D.trend_id, AVG(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table} as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend})
                                            AND date_time BETWEEN '${from}' AND '${until}' ORDER BY D.id DESC LIMIT '${limit}' `);
        }


        const res = await this.db.prepare(queryString);
        return res.all();
    };

    requestDataMin = async ({trend, data_table, trend_table, from,until,limit}) => {
        //this.node.log("get min of: "+trend);

        let queryString;
        if(from == undefined || from == "undefined") {
            queryString =(`SELECT D.id, D.trend_id, MIN(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table}  as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend}) ORDER BY D.id DESC
                                            LIMIT '${limit}' `);
        }else {
            queryString =(`SELECT D.id, D.trend_id, MIN(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table} as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend})
                                            AND date_time BETWEEN '${from}' AND '${until}' ORDER BY D.id DESC LIMIT '${limit}' `);
        }


        const res = await this.db.prepare(queryString);
        return res.all();
    };

    requestDataMax = async ({trend, data_table, trend_table, from,until,limit}) => {
        //this.node.log("get max of: "+trend);

        let queryString;
        if (from == undefined || from == "undefined") {
            queryString =(`SELECT D.id, D.trend_id, MAX(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table}  as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend}) ORDER BY D.id DESC
                                            LIMIT '${limit}' `);
        }else {
            queryString =(`SELECT D.id, D.trend_id, MAX(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table} as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend})
                                            AND date_time BETWEEN '${from}' AND '${until}' ORDER BY D.id DESC LIMIT '${limit}' `);
        }


        const res = await this.db.prepare(queryString);
        return res.all();
    };

    requestDataDiff = async ({trend, data_table, trend_table, from,until,limit}) => {
        //this.node.log("get diff of: "+trend);


        this.db.aggregate('getDiff', {
            start: () => [],
            step: (array, nextValue) => {
                array.push(nextValue);
            },
            result: array => (array[array.length-1]-array[0]),
        });

        let queryString;
        if (from == undefined || from == "undefined") {
            queryString =(`SELECT D.id, D.trend_id, getDiff(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table}  as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend}) ORDER BY D.id DESC
                                            LIMIT '${limit}' `);
        }else {
            queryString =(`SELECT D.id, D.trend_id, getDiff(D.value), D.date_time, D.status, T.name, T.config  FROM ${data_table} as D INNER JOIN ${trend_table} as T ON D.trend_id=T.id
                                             WHERE trend_id IN (${trend})
                                            AND date_time BETWEEN '${from}' AND '${until}' ORDER BY D.id DESC LIMIT '${limit}' `);
        }


        const res = await this.db.prepare(queryString);
        return res.all();
    };
    closeDB(){
        this.db.close();
    }
    closeDB = async () =>{
        //this.node.log("close db connection");
        this.db.close();

}
     generateDatabaseDateTime(date) {

         if (date == undefined) {
             return undefined;
         }
         if (!date instanceof Date) {
             date = new Date(date);
         }
        return `${date.getUTCFullYear()}-${this.pad(date.getUTCMonth() + 1, 2)}-${this.pad(date.getUTCDate(), 2)} ${this.pad(date.getUTCHours(), 2)}:${this.pad(date.getUTCMinutes(), 2)}:${this.pad(date.getUTCSeconds(), 2)}`;
    }
    pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }
    setNow(msg) {
        if (msg.date_time == null || msg.date_time == "undefined") {
            return new Date();
        } else {
            return new Date(msg.date_time)
        }
    }


}
module.exports = Sqlite;




