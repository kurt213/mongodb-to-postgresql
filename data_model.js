// Store PostgreSQL database models here
/* 
    First item in each table list is the name of the Postgres table and should match the collection name in MongoDB
    Second item in each table should be the Primary Key item
    Third item onwards are the columns that you want to migrate from MongoDB to Postgres. The names should match the MongoDB names, unless you want to create a custom rule in the migration script
*/

module.exports.all_models = {
    mongo_dummy_data_books_model: [
        'mongo_dummy_data_books',
        '_id VARCHAR(50) PRIMARY KEY NOT NULL | table1',
        'title TEXT | table1',
        'isbn VARCHAR(100) | table1',
        'pageCount INT4 | table1',
        'created_at TIMESTAMPTZ | table1',
        'thumbnailUrl VARCHAR(200) | table1',
        'shortDescription TEXT | table1',
        'longDescription TEXT | table1',
        'status VARCHAR(50) | table1',
        'authors _TEXT | table1',
        'categories _TEXT | table1',
    ],
    /*table2_model: [
        'table2',
        '_id VARCHAR(50) PRIMARY KEY NOT NULL | table2',
        "expires TIMESTAMPTZ DEFAULT '2015-01-01' | table2",
        'size INT4 NOT NULL | table2',
    ],*/
}