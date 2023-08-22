# SQL Lite config node
| name        | meaning                                    | 
|-------------|--------------------------------------------|
| path        | path to database file                      | 
| table_data  | name of table                              | 
| name        | name of config node                        |  
| table_trend | name of table where trend config is stored |

# Logger
On receiving Creates Messages Object (Create Sample, Update Trend, Delete Samples) to interacting with Sql-Lite Node

## Properties

| name            | meaning                                            | 
|-----------------|----------------------------------------------------|
| TrendID         | Trend ID which represents this instance of node    | 
| Logsize in Days | how many days the data will remain in the Database |

### Input

| message object | meaning                                             | 
|----------------|-----------------------------------------------------|
| msg.payload    | Value written into the SQL-Lite                     | 
| msg.error      | if error is present writes Value with staus code 16 | 



### Status Codes

| Code | meaning           | 
|------|-------------------|
| 0    | OK                | 
| 16   | msg.error present | 
| 16   | empty Payload     |  



## SQL-Lite

## Actions

| topic          | meaning                                                | 
|----------------|--------------------------------------------------------|
| Delete Samples | Deletes  Samples for a trend id before a specific date | 
| Update Trend   | update Trend configuration                             | 
| Create Sample  | creates sample                                         | 
| Delete Trend   | Deletes all sample + Trend configuration               | 
| Get Data       | Returns Requested Samples                              | 
| Get All Trends | Deletes all sample + Trend configuration               | 


### Delete Samples

#### Payload


| Payload    | meaning                                   | 
|------------|-------------------------------------------|
| deleteDate | Delete Until when Samples will be deleted | 
| id         | Trend Id                                  | 

#### Output

None

### Update Trend

#### Payload

| Payload | meaning                                                                | 
|---------|------------------------------------------------------------------------|
| name    | name of the trend                                                      | 
| config  | config of update intervall of Trend(cron tab expression / asynchronous | 
| id      | id of trend                                                            |

#### Output 
None

### Create Sample

#### Payload

| Payload      | meaning                                                         | 
|--------------|-----------------------------------------------------------------|
| trend_id     | Id of Trend                                                     | 
| status       | status of sample for further Information on Status Code Section | 
| value        | Value of Sample                                                 |
| date_time    | Date Time when the Value was logged                             |

#### Output 
None

### Delete Trend



#### Payload

Trend ID of the trend which should be deleted

#### Output 
None

### Get Data

#### Payload

| Payload        | meaning                             | 
|----------------|-------------------------------------|
| aggregation    | aggregation (NONE,DIFF,MAX,MIN,SUM) | 
| from           | Start Date Time                     | 
| until          | End Date Time                       |
| limit          | maximum amount of Samples           |
| listTrendIds   | Array of Trend Ids                  |

#### Output

Array with the requested Samples

### Get All Trends

#### Payload 
None
#### 
Array of Trends







### Rest-Server

| attribute         | meaning                                     | 
|-------------------|---------------------------------------------|
| port              | Port on which Rest Server is running        | 
| SQL-DB Connection | Connection to SQL-Lite                      |
| Username          | Username for api authentication (basicAuth) |
| Password          | Password for api authentication (basicAuth) |



### Paylaod

| payload  | meaning           | 
|----------|-------------------|
| START    | Starts Web Server | 
| STOP     | Stops Web Server  |


#### Api Documentation

url:port/doc



