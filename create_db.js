let report_models = require('./data_model.js')
var MongoConnection = require( './mongo_db.js' );
var PostgresConnection = require( './postgres_db.js' );

module.exports = async function (complete) {
    // table name as index 0, followed by column & data types
    console.log('Creating Postgres models')

    let all_models = Object.values(report_models.all_models)
    let model_comparison = []

    for (i = 0; i < all_models.length; i++) {
        try {
        console.log('checking table...')
        let all_cols = all_models[i].map(function (x) {
            return x.replace(/ \|.*/g, '')
        })
        let table_name = all_cols.shift()
        console.log(table_name)
        let check_text =
            "SELECT table_name, column_name, is_nullable, udt_name, character_maximum_length FROM information_schema.columns WHERE table_name = '" +
            table_name +
            "'"
        let res = await PostgresConnection().query(check_text)
        model_comparison = []
        // if table exists, create array to compare with existing table
        if (res.rows.length !== 0) {
            for (let t = 0; t < res.rows.length; t++) {
            model_comparison.push(
                res.rows[t].column_name /* +
                ' ' +
                res.rows[t].udt_name.toUpperCase() +
                (res.rows[t].character_maximum_length !== null
                    ? '(' + res.rows[t].character_maximum_length + ')'
                    : '') +
                (t === 0 ? ' PRIMARY KEY' : '') +
                (res.rows[t].is_nullable === 'NO' ? ' NOT NULL' : '')*/
            )
            }
            // sort both arrays so they match - in case model ordering has changed
            var all_fields = all_cols.map(function (x) {
            return x.replace(/(^[^ ]+)/g, function (y) {
                return y.toLowerCase()
            })
            })
            all_fields_x = all_fields.slice()
            all_fields = all_fields.map(function (x) {
            //return x.replace(/ DEFAULT.*/g, '').replace(/ UNIQUE.*/g, '')
                return x.replace(/ .*/g, '') 
            })
            all_fields_x = all_fields_x.map(function (x) {
                return x.replace(/ \|.*/g, '')
            })
            all_fields.sort()
            all_fields_x.sort()
            model_comparison.sort()
            console.log('all_fields: ', all_fields)
            console.log('model_comparison: ', model_comparison)

            var toAdd = []
            var toRemove = []
            // Delete removed columns
            model_comparison.map(r => {
            if (all_fields.indexOf(r) < 0) toRemove.push(r.replace(/ .*/g, ''))
            })
            console.log('to remove: ' + toRemove)
            let combine_del = toRemove.join(', DROP COLUMN ')
            let del_text =
            'ALTER TABLE ' + table_name + ' DROP COLUMN ' + combine_del
            if (toRemove.length > 0) {
                console.log(del_text)
                await PostgresConnection().query(del_text)
            }

            // Insert new columns
            all_fields.map((r, i) => {
            if (model_comparison.indexOf(r) < 0) toAdd.push(all_fields_x[i])
            })
            console.log('to add: ' + toAdd)
            let combine_ins = toAdd.join(', ADD COLUMN ')
            let ins_text =
            'ALTER TABLE ' + table_name + ' ADD COLUMN ' + combine_ins
            if (toAdd.length > 0) {
                console.log(ins_text)
                await PostgresConnection().query(ins_text)
            }
            
        }
        let combine_cols = all_cols.join(', ')
        // If table does not exist, create it
        if (res.rows.length === 0) {
            console.log('creating table...')
            let text = 'CREATE TABLE ' + table_name + '(' + combine_cols + ')'
            console.log(text)
            await PostgresConnection().query(text)
        }
        } catch (err) {
        console.log(err.stack)
        }
        }       

        console.log('complete')
        if (typeof complete === 'function') complete()
    }