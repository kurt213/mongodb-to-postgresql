let async = require('async')
let moment = require('moment')
let waterfall = require('async-waterfall')
let report_models = require('./data_model.js')
let MongoConnection = require('./mongo_db.js');
var PostgresConnection = require('./postgres_db.js');

let db

// Data migration method and module. Logic for migrating data from MongoDB to PostgreSQL

// -------------------------------------

let MigrationIsRunning = false

module.exports = function (complete) {

    if (MigrationIsRunning) {
        console.log('Migration script is still running')
        MigrationIsRunning = true
        return
    }
    MigrationIsRunning = true
    console.log('start')

    // Extract  all models from data_model.js
    let models = Object.getOwnPropertyNames(report_models.all_models)
    let now = moment().format('')
    let models_index = []

    for (let rm in models) {
        models_index.push(rm)
    }

    // Declared variables
    let table_name = ''
    let columns = []
    let latest_update_date = ''
    let latest_create_date = ''
    let columns_string = ''
    let pg_columns_String = ''
    let pgUpdateStatement = ''
    let pgInsertStatement = ''
    let no_data_flag = ''
    let pg_columns = []
    let updated_at_flag = false
    let created_at_flag = false
    let model_name = ''
    let model_data_type = []
    let pg_update_res
    let pg_create_res

    let model_transform = async function (base_model, cb) {
        // Get table name
        let base_model_input = report_models.all_models[models[base_model]]
        let model_input = base_model_input.slice()
        model_data_type = model_input.map(function (x) {
            return x.split(/\s+/)[1]
        })

        table_name = model_input.shift()
        model_name = table_name.replace(/s$/, '')
        model_data_type.shift()

        // remove data type information from model
        columns = []
        let index = 0
        for (let m = 0; m < model_input.length; m++) {
            index = model_input[m].indexOf(' ')
            columns.push(model_input[m].substring(0, index))
        }

        // check if created at or updated at fields exist
        created_at_flag = false
        updated_at_flag = false
        pg_columns = []
        pg_columns.push(columns[0])
        if (columns.includes('created_at')) {
            pg_columns.push('created_at')
            created_at_flag = true
        }
        if (columns.includes('updated_at')) {
            pg_columns.push('updated_at')
            updated_at_flag = true
        }

        latest_update_date = ''
        latest_create_date = ''

        columns_string = columns.join(', ')
        pg_columns_String = pg_columns.join(', ')
        pgUpdateStatement = ''
        pgInsertStatement = ''
        no_data_flag = ''

        cb()
    }

    function json_key(object, key, k) {
        let out_array = [];

        if (typeof(object) === 'undefined') {
            return null
        }
        let json = JSON.parse(JSON.stringify(object))

        if (object === null) {
            return null
        } else {
            if (
                JSON.stringify(json[key]) === 'null' ||
                typeof json[key] === 'undefined'
            ) {

                return null
            } else if (
                JSON.stringify(json[key]).replace(/(\r\n|\n|\r)/gm, '').length > 0
            ) {
                // logic for different data types, i.e. date - moment, integer - convert number if needed
                if (model_data_type[k].indexOf('JSONB') !== -1) {
                    return JSON.stringify(json[key])
                }
                else if (model_data_type[k].indexOf('_') !== -1) {
                    for (j in (json[key]) ) {
                        out_array.push(json[key][j])
                    }
                    return out_array
                }
                else if (model_data_type[k].indexOf('TIMESTAMP') !== -1) {
                    if (json[key] === null) {
                        print('this time is null')
                    }
                    return moment(
                        JSON.stringify(json[key])
                            .replace(/(\r\n|\n|\r)/gm, '')
                            .replace(/"/gm, '')
                    ).format()
                } else if (
                    model_data_type[k].indexOf('INT') !== -1 ||
                    model_data_type[k].indexOf('NUMERIC') !== -1
                ) {
                    return Number(
                        JSON.stringify(json[key])
                            .replace(/(\r\n|\n|\r)/gm, '')
                            .replace(/"/g, '')
                    )
                } else {
                    return JSON.stringify(json[key])
                        .replace(/(\r\n|\n|\r)/gm, '')
                        .replace(/"/gm, '')
                }
            } else {
                return key + ' is an empty string'
            }
        }
    }

    function pgUpdateQuery(cols) {
        // Setup static beginning of query
        let query = ['UPDATE ' + table_name]
        query.push('SET')

        // Create an array of the columns to update - skip first column which is for the WHERE
        let set = []
        for (let col = 0; col < cols.length - 1; col++) {
            set.push(cols[col + 1] + ' = ($' + (col + 2) + ')')
        }
        query.push(set.join(', '))

        // Add the WHERE statement to look up by id
        query.push('WHERE ' + pg_columns[0] + ' = $1')

        // Return a complete query string
        return query.join(' ')
    }

    let pgGenerate = async function (cb) {
        // create $1, $2, $3 for PG INSERT statement
        console.log('pgGenerate')
        let insert_values_array = Array.from({ length: columns.length }, (v, k) =>
            String('$' + (k + 1))
        )
        let insert_values_string = insert_values_array.join(', ')
        pgInsertStatement =
            'INSERT into ' +
            table_name +
            ' (' +
            columns_string +
            ') VALUES (' +
            insert_values_string +
            ')'
        // create $1, $2, $3 etc. for PG Update Statement
        pgUpdateStatement = pgUpdateQuery(columns)
        cb()
    }

    // Extraction of currently existing data in Postgres
    let pgExtract = async function (cb) {
        console.log('pgExtract')
        let pgUpdateText =
            'SELECT ' +
            pg_columns_String +
            ' from ' +
            table_name +
            ' WHERE updated_at IS NOT NULL ORDER BY updated_at DESC LIMIT 5'
        let pgCreateText =
            'SELECT ' +
            pg_columns_String +
            ' from ' +
            table_name +
            ' WHERE created_at IS NOT NULL ORDER BY created_at DESC LIMIT 5'
        let pgAllText = 
            'SELECT ' +
            pg_columns_String +
            ' from ' +
            table_name +
            ' LIMIT 5'

        if (updated_at_flag) {
            pg_update_res = await PostgresConnection().query(pgUpdateText)
        }
        if (created_at_flag) {
            pg_create_res = await PostgresConnection().query(pgCreateText)
        }
        pg_all_res = await PostgresConnection().query(pgAllText)

        // console.log(pg_update_res)
        // console.log(pg_create_res)
        if (typeof pg_all_res.rows[0] === 'undefined') {
            no_data_flag = 'yes'
            console.log('no postgres data found')
        } else {
            if (updated_at_flag) {
                latest_update_date = moment(pg_update_res.rows[0].updated_at)
                    .add(1, 'seconds')
                    .toISOString()
                console.log('latest updated_at date: ' + latest_update_date)
            }
            if (created_at_flag) {
                latest_create_date = moment(pg_create_res.rows[0].created_at)
                    .add(1, 'seconds')
                    .toISOString()
                console.log('latest created_at date: ' + latest_create_date)
            }

        }
        cb()
    }

    async function mongoConnect(cb) {

        MongoConnection.connectToServer(function (err, client) {
            console.log('mongo connect')
            if (err) console.log(err);
            db = MongoConnection.getDb();
            cb()
        })

    }

    // -------------------------------------------------------
    async function startMongoExtract(queryType, cMessage, cb) {

        console.log(queryType)
        if ((no_data_flag == 'yes' && queryType == 'all_data') || (no_data_flag != 'yes' && ((queryType == 'existing_data' && updated_at_flag) || (queryType == 'new_data' && created_at_flag) ))) {
            let count = null
            let found = null
            let limit = 250
            let max = 10000

            while ((found === null || found == limit) && count < max) {

                console.log(found, limit)
                console.log(table_name)
                console.log(queryType)

                mongo_data = await new Promise((resolve, reject) => {

                    if (queryType == 'new_data' && created_at_flag) {
                        db.collection(table_name)
                            .find({ created_at: { $gte: new Date(latest_create_date) } })
                            .sort({ created_at: 1 })
                            .skip(count === null ? 0 : count)
                            .limit(limit)
                            .toArray((err, items) => {
                                resolve(items)
                            });
                    } else if (queryType == 'existing_data' && updated_at_flag) {
                        db.collection(table_name)
                            .find({ updated_at: { $gte: new Date(latest_update_date) } })
                            .sort({ updated_at: 1 })
                            .skip(count === null ? 0 : count)
                            .limit(limit)
                            .toArray((err, items) => {
                                resolve(items)
                            });
                    } else if (queryType == 'all_data') {
                        db.collection(table_name)
                            .find({})
                            // .sort({ created_at: 1 })
                            .skip(count === null ? 0 : count)
                            .limit(limit)
                            .toArray((err, items) => {
                                resolve(items)
                            });
                    } else {
                        reject('error')
                    }

                })

                let rows = []

                for (let md in mongo_data) {
                    try {
                        let data_row = mongo_data[md]
                        console.log(md)

                        var insert_row = []
                        for (let j = 0; j < columns.length; j++) {
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
                    } catch (e) {
                        console.log(e)
                    }
                    rows.push(insert_row)
                }

                found = mongo_data.length
                count += found
                console.log('COUNT:' + count)
                console.log('FOUND:' + found)
                console.log('ROWS:' + rows.length)

                for (r in rows) {
                    try {
                        let values = rows[r]
                        if ( (queryType == 'new_data' && created_at_flag) || queryType == 'all_data') {
                            await PostgresConnection().query(pgInsertStatement, values)
                        } else if (queryType == 'existing_data' && updated_at_flag) {
                            await PostgresConnection().query(pgUpdateStatement, values)
                        } else {
                            console.log('No query type')
                        }
                    } catch (err) {
                        console.log(err.stack)
                    }
                }
                console.log(table_name + ' data copied successfully')
            }
            console.log(cMessage)
        }
        cb()
        //})
    }
    // -----------------------------

    async.forEachLimit(
        models_index,
        1,
        function (m, modelcb) {
            waterfall([
                async.apply(model_transform, m),
                pgGenerate,
                pgExtract,
                mongoConnect,
                async.apply(startMongoExtract, 'all_data', 'All Data Inserted'),
                async.apply(startMongoExtract, 'new_data', 'New Data Inserted'),
                async.apply(startMongoExtract, 'existing_data', 'Updated Data Inserted'),
                function (cb) {
                    cb()
                }
            ],
                function (err, result) {
                    console.log('model ' + m + ' complete')
                    modelcb()
                }
            )
        },
        function (err) {
            console.log(err)
            console.log('complete')
            MigrationIsRunning = false
            if (typeof complete === 'function') setTimeout(complete, 1000)
        }
    )
}
