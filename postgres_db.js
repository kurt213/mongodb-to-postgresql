const pg = require('pg')
const pg_json = require('./db_details.json')

// Postgres database connection module

// -------------------------------------


let pg_config = pg_json.postgres_connection

let pg_connect = new pg.Pool(pg_config)

module.exports = () => { return pg_connect; }