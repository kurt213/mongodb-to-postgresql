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
4. Configure custom fields (if required)
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
The field and table names need to match each other to pick up the correct collection name and fields

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
    ],
    table_2_model: [
        'table_2',
        '_id VARCHAR(50) PRIMARY KEY NOT NULL'
    ]
}
```

#### Configure Custom Fields (If Required)
There may be custom fields that you want to access that require more complex logic. Some example use cases are:
1. The MongoDB field has a different name to the field name you want in Postgres
2. The MongoDB field is nested within an object (see the example process below for more detail on this)
3. You want to perform a transformation of the data prior to loading into Postgres

These custom field rules are created in the migrate_data.js file, in rows 321 onwards. The code block looks like this:
```
// custom rules applied in this switch statement if needed, otherwise default will be used
// -------------------------------------------------------
switch (columns[j]) {
    // custom rule for extracting value from child level i.e. 'common' that is stored in the 'name' object
    case 'common_name':
        insert_row.push(
            json_key(data_row.name, 'common', j)
        )
        break
    default:
        insert_row.push(
            json_key(data_row, columns[j], j)
        )
}
// -------------------------------------------------------
}
```
In the example shown here, the column defined in the data model as common_name will have a custom rule applied. 
In this case, a property 'common' in the 'name' object in a MongoDB document is what wants to be migrated.

#### Run Database Creation & Migration Scripts
There are two basic scripts for this tool. To run them, navigate to the root folder of this repository and run:
```
node start.js createdb
```
This will create the database model defined in the data_model.js file into your chosen Postgres instance.  For basic changes, you can make changes to your data model and re-run the script to add or delete columns. 
```
node start.js migratedata
```
This will execute the data migration from MongoDB to PostgreSQL based on the data model and custom rules setup. This can be run once to migrate data as a one off process. Optionally, if using 'created_at' and 'updated_at' timestamp dates in MongoDB and these have been included in the data_model.js setup, the script can be run at regular intervals to transfer new or updated documents to Postgres

## Other Information

### Further Notes

Please don't hesitate to provide feedback, feature improvements and bugs on this repository.

### To Do

- Provide example data step through
- Use case information for timestamp fields
- Make timestamp field names customisable
- Currently, migration script can only be run once without timestamp fields, with data needing to be deleted before performing a new migration. If not using timestamp fields, potentially create option to remove and re-migrate data instead