# mongodb-to-postgresql
A tool to migrate and replicate data from MongoDB to PostgreSQL in Node.js. 

The tool works by creating an object data model which includes all data fields that you want to migrate to SQL and executing a migration script. The tool has the option to either run as a one off script, or can be setup to keep your replicated PostgreSQL database in sync with MongoDB. 

## Getting Started

These instructions will get the project set up on your local machine for running the tool.

### Prerequisites

1. Node.js (Tested on V10.15.3)
2. Node Package Manager (Tested on 6.4.1)
3. PostgreSQL server (Tested on 10.3)
4. MongoDB server (Tested on 4.0.0)

### Setup

There are four steps for setup:
1. Setting up your local environment
2. Configure database connection settings
3. Configure Data Model
4. Run scripts

#### Environment Setup

Once you have cloned this repository into a local folder, navigate to the folder in your choice of console/terminal, and run:
```
npm install
```
Once installed, you can type 'npm list' into the command prompt and should see something similar to (list below is truncated and will include more packages in your local install):
```
+-- async@3.1.0
+-- async-waterfall@0.1.5
+-- moment@2.24.0
+-- mongodb@3.2.7
| +-- mongodb-core@3.2.7
`-- pg@7.11.0
  +-- buffer-writer@2.0.0
  +-- packet-reader@1.0.0
  +-- pg-connection-string@0.1.3
  +-- pg-pool@2.0.6
```

#### Database Connection Settings
Enter your MongoDB and PostgreSQL database connection settings in the db_details.json file:
```
Example:
{
    "mongo_connection": {
        "url": "mongodb://localhost:27017",
        "database": "mongodb_to_postgres"
    },
    "postgres_connection": {
        "user": "postgres",
        "host": "localhost",
        "database": "mongo_test",
        "password": "xxxxx",
        "port": "5432"
    }
}
```

#### Configure Database Model
An example database model setup has already been created based on the JSON data in the 'dummy_data' folder. Please see the section further down for instructions on running the example data.

The object data model is an object created in the data_model.js file. this contains a list of objects (one for each table), and within each of these an array with information on the table, field names and field types.
The field and table names MUST match the collection name and fields

```
Example:

module.exports.all_models = {
    table_1_model: [
        'table_1', // first item is always table (collection) name
        '_id VARCHAR(50) PRIMARY KEY NOT NULL', // second item is primary key field
        'created_at TIMESTAMPTZ', // this field is necessary for automatic sync (optional)
        'updated_at TIMESTAMPTZ', // this field is necessary for automatic sync (optional)
        'title TEXT',
        'authors _TEXT', // this is an array field
        'languages JSONB' // this is a json field
    ]
}
```

TBC...
