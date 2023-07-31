const basicAuth = require('express-basic-auth')
const sqlite3 = require("../../database/db-access");
let expression = true
const pino = require('pino');
const {query} = require("express");
const logger = pino({
    level: 'info'
});


module.exports = function (app, config, sqlite, credentials) {

    /* NOTE: 100% automatic */
    app.get('/api/trends', basicAuth({authorizer: myAuthorizer, unauthorizedResponse: getUnauthorizedResponse}
    ), (req, res) => {
        logger.debug("/api/trends");

       /* #swagger.responses[401] = { description: "Unauthorized" }*/

        /* #swagger.responses[200] = {
                   description: 'User successfully obtained.',
                   schema: [
                    {
                    "id": "0133029a65e30872",
                    "name": ""
                    },
                    {
                    "id": "056846787149e04e",
                    "name": ""
                    },
                   ]
           } */


        /* #swagger.security = [{
                "basicAuth": []
        }] */


        res.setHeader('Content-Type', 'application/json')
        sqlite.requestTrends({trend_table: config.trend_table}).then(value => {
            logger.debug("Send Value: "+value)
            res.status(200).send(value);
        }).catch(reason => {
            logger.error(reason);
            res.status(400).send(reason);
        }).finally(() => {
            sqlite3.closeDB;
        })
    })

    /* NOTE: 100% automatic */
    app.get('/api/data', basicAuth({
            authorizer: myAuthorizer, unauthorizedResponse: getUnauthorizedResponse}
    ), (req, res) => {
        logger.debug("/api/data"+req.query);
        /* #swagger.security = [{
              "basicAuth": []
      }]
      */
        /* #swagger.responses[401] = { description: "Unauthorized" }*/
        /*  #swagger.parameters['id'] = {
              in: 'query',
              description: 'Trend ID',
              required: true,
              type: 'string'
          }
      */


        /*  #swagger.parameters['from'] = {
               in: 'query',
               description: 'from date in from yyyy-MM-dd HH:mm:ss in UTC',
               required: false,
               type: 'string'
           }
       */

        /*  #swagger.parameters['until'] = {
              in: 'query',
              description: 'until date in from yyyy-MM-dd HH:mm:ss in UTC',
              required: false,
              type: 'string'
          }
      */

        /*  #swagger.parameters['limit'] = {
            in: 'query',
            description: 'Limit of Data Samples',
            required: false,
            type: 'string'
        }
    */

        /*  #swagger.parameters['aggregation'] = {
             in: 'query',
             description: 'aggregation methode (none,sum,avg,min,max,diff)',
             required: false,
             type: 'string'
         }
     */

        res.setHeader('Content-Type', 'application/json')
        let trend = [req.query.id];
        let from = req.query.from;
        let until = req.query.until;
        let limit = req.query.limit;
        if (limit == undefined) limit = 1000;
        if (req.query.aggregation == undefined || req.query.aggregation == "none") {
            sqlite.requestData({
                trend: getTrendIds(trend),
                from: from,
                until: until,
                limit: limit,
                trend_table: config.trend_table,
                data_table: config.data_table
            }).then(value => {
                logger.debug(value);
                res.status(200).send(value);
            }).catch(reason => {
                logger.error(reason);
                res.status(400).send(reason);
            }).finally(() => {
                sqlite3.closeDB;
            });
        } else if (req.query.aggregation == "sum") {
            sqlite.requestDataSum({
                trend: getTrendIds(trend),
                from: from,
                until: until,
                limit: limit,
                trend_table: config.trend_table,
                data_table: config.data_table
            }).then(value => {
                logger.error(value);
                res.status(200).send(value);

            }).catch(reason => {
                logger.error(reason);
                res.status(400).send(reason);
            }).finally(() => {
                sqlite3.closeDB;
            });
        } else if (req.query.aggregation == "avg") {
            sqlite.requestDataAvg({
                trend: getTrendIds(trend),
                from: from,
                until: until,
                limit: limit,
                trend_table: config.trend_table,
                data_table: config.data_table
            }).then(value => {
                logger.debug(value);
                res.status(200).send(value);

            }).catch(reason => {
                logger.error(reason);
                res.status(400).send(reason);
            }).finally(() => {
                sqlite3.closeDB;
            });
        } else if (req.query.aggregation == "max") {
            sqlite.requestDataMax({
                trend: getTrendIds(trend),
                from: from,
                until: until,
                limit: limit,
                trend_table: config.trend_table,
                data_table: config.data_table
            }).then(value => {
                logger.debug(value);

                res.status(200).send(value);

            }).catch(reason => {
                logger.error(reason);
                res.status(400).send(reason);
            }).finally(() => {
                sqlite3.closeDB;
            });
        } else if (req.query.aggregation == "min") {
            sqlite.requestDataMin({
                trend: getTrendIds(trend),
                from: from,
                until: until,
                limit: limit,
                trend_table: config.trend_table,
                data_table: config.data_table
            }).then(value => {
                logger.debug(value);
                res.status(200).send(value);

            }).catch(reason => {
                logger.error(reason);
                res.status(400).send(reason);
            }).finally(() => {
                sqlite3.closeDB;
            });
        } else if (req.query.aggregation == "diff") {
            sqlite.requestDataDiff({
                trend: getTrendIds(trend),
                from: from,
                until: until,
                limit: limit,
                trend_table: config.trend_table,
                data_table: config.data_table
            }).then(value => {
                logger.debug(value);
                res.status(200).send(value);

            }).catch(reason => {
                logger.error(reason);
                res.status(400).send(reason);
            }).finally(() => {
                sqlite3.closeDB;
            });
        }

    })


    function myAuthorizer(username, password) {
        const userMatches = basicAuth.safeCompare(username, credentials.username)
        const passwordMatches = basicAuth.safeCompare(password, credentials.password)

        return userMatches && passwordMatches
    }

    function getUnauthorizedResponse(req) {
        return req.auth
            ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
            : 'No credentials provided'
    }


}


function getTrendIds(trends) {
    let listTrendIds = "";

    trends.forEach((element) => {
        if (listTrendIds !== "") {
            listTrendIds += ",";
        }
        listTrendIds += "'";
        listTrendIds += element;
        listTrendIds += "'";

    });

    return listTrendIds;
}