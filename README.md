### SQL Lite config node
| name        | meaning                                    | 
|-------------|--------------------------------------------|
| path        | path to database file                      | 
| table_data  | name of table                              | 
| name        | name of config node                        |  
| table_trend | name of table where trend config is stored |

### Logger
On receiving message logs data into a SQL-Lite 

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


### API

| attribute         | meaning                                     | 
|-------------------|---------------------------------------------|
| port              | Port on which Rest Server is running        | 
| SQL-DB Connection | Connection to SQL-Lite                      |
| Username          | Username for api authentication (basicAuth) |
| Password          | Password for api authentication (basicAuth) |



### Paylaod

| payload  | meaning                                     | 
|----------|---------------------------------------------|
| START    | Startes Web Server                          | 
| STOP     | Stops Web Server                            |


#### Api Documentation

url:port/doc



