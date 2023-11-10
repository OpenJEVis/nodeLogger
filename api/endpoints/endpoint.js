const fs = require("fs").promises;
const http = require("http");
const converter = require("json-2-csv");
module.exports = function (app, config, sqlite, credentials) {
    const basicAuth = require('express-basic-auth')
    const sqlite3 = require("../../database/db-access");
    let expression = true
    const pino = require('pino');
    const {query} = require("express");


    /* NOTE: 100% automatic */
    app.get('/api/trends', basicAuth({authorizer: myAuthorizer, unauthorizedResponse: getUnauthorizedResponse}
    ), (req, res) => {

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
            res.status(200).send(value);
        }).catch(reason => {
            res.status(400).send(reason);
        }).finally(() => {
            sqlite.closeDB;
        })
    })

    app.get("/api/download", basicAuth({
        authorizer: myAuthorizer,
        unauthorizedResponse: getUnauthorizedResponse
    }), (req, res) => {
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
             description: 'aggregation methode (NONE,SUM,AVG,MIN,MAX,DIFF)',
             required: false,
             type: 'string'
         }
     */

        /*  #swagger.parameters['filename'] = {
       in: 'query',
       description: 'name of the filename',
       required: true,
       type: 'string'
   }
*/
        let trend = [req.query.id];
        let from = req.query.from;
        let until = req.query.until;
        let limit = req.query.limit;
        let filename = req.query.filename;


        sqlite.request({
            aggregation: req.query.aggregation,
            trend: getTrendIds(trend),
            from: from,
            until: until,
            limit: limit,
            trend_table: config.trend_table,
            data_table: config.data_table

        }).then(value => {

            const csv = converter.json2csv(value, {delimiter: ';'});
            // fs.writeFile("/tmp/"+filename+".csv", csv, function(err) {
            //     if(err) {
            //         return console.log(err);
            //     }
            //     console.log("The file was saved!");
            //
            // });
            fs.writeFile("/tmp/" + filename + ".csv", csv,).then(value1 => {
                console.log("The file was saved!");
                res.download("/tmp/" + filename + ".csv", function (err) {
                    if (err) {
                        console.log(err);
                    }
                    fs.unlink("/tmp/" + filename + ".csv");
                });
            }).catch(reason => {
                res.status(400).send(reason).end();
            })
        }).finally(() => {
            sqlite.closeDB
        });
    })
    /* NOTE: 100% automatic */
    app.get('/api/data', basicAuth({
            authorizer: myAuthorizer, unauthorizedResponse: getUnauthorizedResponse
        }
    ), (req, res) => {


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
             description: 'aggregation methode (NONE,SUM,AVG,MIN,MAX,DIFF)',
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
        sqlite.request({
            aggregation: req.query.aggregation,
            trend: getTrendIds(trend),
            from: from,
            until: until,
            limit: limit,
            trend_table: config.trend_table,
            data_table: config.data_table

        }).then(value => {
            res.status(200).send(value).end();
        }).catch(reason => {
            res.status(400).send(reason).end();
        }).finally(() => {
            sqlite.closeDB;
        })
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