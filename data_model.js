// Store PostgreSQL database models here
/* 
    First item in each table list is the name of the Postgres table and should match the collection name in MongoDB
    Second item in each table should be the Primary Key item
    Third item onwards are the columns that you want to migrate from MongoDB to Postgres. The names should match the MongoDB names, unless you want to create a custom rule in the migration script 
*/

module.exports.all_models = {
    mongo_dummy_data_books_model: [
        'mongo_dummy_data_books', // first item is always table / collection name
        '_id VARCHAR(50) PRIMARY KEY NOT NULL', // second item is primary key field
        'title TEXT',
        'isbn VARCHAR(100)',
        'pageCount INT4',
        'created_at TIMESTAMPTZ',
        'thumbnailUrl VARCHAR(200)',
        'shortDescription TEXT',
        'longDescription TEXT',
        'status VARCHAR(50)',
        'authors _TEXT', // array - _ before field type
        'categories _TEXT',
    ],
    mongo_dummy_data_countries_model: [
        'mongo_dummy_data_countries',
        '_id VARCHAR(50) PRIMARY KEY NOT NULL',
        'altSpellings _TEXT',
        'area NUMERIC',
        'borders _TEXT',
        'callingCode _TEXT',
        'capital VARCHAR(100)',
        'languages JSONB', // JSONB
        'common_name VARCHAR(100)', // Custom field - see  migrate_data.js for details
    ],
    mongo_dummy_data_profiles_model: [
        'mongo_dummy_data_profiles',
        '_id VARCHAR(50) PRIMARY KEY NOT NULL',
        'client TEXT',
        'updated_at TIMESTAMPTZ', //updated_at and created_at fields can be used to auto update data dynamically
    ],    
}