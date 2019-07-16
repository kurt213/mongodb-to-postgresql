// Store PostgreSQL database models here
/* 
    First item in each table list is the name of the Postgres table and should match the collection name in MongoDB
    Second item in each table should be the Primary Key item
    Third item onwards are the columns that you want to migrate from MongoDB to Postgres. The names should match the MongoDB names, unless you want to create a custom rule in the migration script
*/

module.exports.all_models = {
    mongo_dummy_data_model: [
        'mongo_dummy_data',
        '_id VARCHAR(50) PRIMARY KEY NOT NULL | table1',
        'student_id INT4 | table1',
        'class_id INT4 | table1',
        'created_at TIMESTAMPTZ | table1',
        'updated_at TIMESTAMPTZ | table1',
        'scores _TEXT | table1'
    ],
    /*table2_model: [
        'table2',
        '_id VARCHAR(50) PRIMARY KEY NOT NULL | table2',
        'plan VARCHAR(50) | table2',
        'user_id VARCHAR(50) | table2',
        'auto_renew VARCHAR(10) | table2',
        'expires TIMESTAMPTZ | table2',
        'created_at TIMESTAMPTZ | table2',
        'updated_at TIMESTAMPTZ | table2',
        'valid_from TIMESTAMPTZ | table2',
    ],
    table3_model: [
        'table3',
        '_id VARCHAR(50) PRIMARY KEY NOT NULL | table3',
        'name VARCHAR(101) | table3',
        'selector_name VARCHAR(102) | table3',
        'description TEXT | table3',
        'trial_period VARCHAR(52) | table3',
        'charge_period INT4 | table3',
        'trial_enquiry_count INT4 | table3',
        'selectable VARCHAR(53) | table3',
        'tag_line TEXT | table3',
        'price_month INT4 | table3',
        'price_year INT4 | table3',
        'commission INT4 | table3',
        'created_at TIMESTAMPTZ | table3',
        'updated_at TIMESTAMPTZ | table3',
    ],*/
}