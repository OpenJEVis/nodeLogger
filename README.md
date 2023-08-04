### SQL Lite config node
| name        | meaning                                    | 
|-------------|--------------------------------------------|
| path        | path to database file                      | 
| table_data  | name of table                              | 
| name        | name of config node                        |  
| table_trend | name of table where trend config is stored |

### Logger
On receiving Creates Messages Object to interacting with Sql-Lite

#### Properties

| name            | meaning                                            | 
|-----------------|----------------------------------------------------|
| TrendID         | Trend ID which represents this instance of node    | 
| Logsize in Days | how many days the data will remain in the Database |

#### Input

| message object | meaning                                             | 
|----------------|-----------------------------------------------------|
| msg.payload    | Value written into the SQL-Lite                     | 
| msg.error      | if error is present writes Value with staus code 16 | 



#### Status Codes

| Code | meaning           | 
|------|-------------------|
| 0    | OK                | 
| 16   | msg.error present | 
| 16   | empty Payload     |  



#### SQL-Lite

#### action

| msg.action     | meaning                                                | payload                                                       |
|----------------|--------------------------------------------------------|---------------------------------------------------------------|
| Delete Samples | Deletes  Samples for a trend id before a specific date | object containing : deleteDate,id,value,date_time             |
| Update Trend   | update Trend configuration                             | object containing : name,config,id                            |
| Create Sample  | creates sample                                         | object containing : tend_id,status,value,date_time            |
| Delete Trend   | Deletes all sample + Trend configuration               | id                                                            |
| Get Data       | Returns Requested Samples                              | object containing : from , until , aggregation, trends, limit |
| Get All Trends | Deletes all sample + Trend configuration               | returns all Trend Configs                                     |


### requestData

#### Request an array of entry's of a specific Trend ID


| message object               | meaning                                       | 
|------------------------------|-----------------------------------------------|
| msg.Topic                    | Trend ID                                      | 
| msg.payload.from             | Date from which you want to request Data      | 
| msg.payload.until            | Date until you want to receive Data           |  
| msg.payload.limit            | limit of data entries                         |




##### Request all available Trends


| message object               | meaning                               | 
|------------------------------|---------------------------------------|
| msg.topic                    | trends                                | 


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



