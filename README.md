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

- Trend ID the Trend ID which represents this instance of node
- log size in Days the time a trend entry will remain in the SQL-Lite Table 

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
msg.Topic = Trend_id
msg.payload.from = Date from which you want to request Data
msg.payload.until = Date until you want to receive Data
msg.payload.limit = limit of data entries

##### Request all available Trends

msg.topic = trends 



