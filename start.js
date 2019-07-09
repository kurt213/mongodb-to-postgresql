let CreateDB = require('./create_db.js')
let MigrateData = require('./migrate_data.js')

if (process.argv[2] !== undefined) {
    switch (process.argv[2]) {
        case 'createdb':
            CreateDB(function() {
                process.exit()
            });
            break
        case 'migratedata':
            MigrateData(function() {
                process.exit()
            });
            break
        default:
            console.log(process.argv[2] + " not found. Try 'createdb' or 'migratedata' ")
            break            
    }
}   
else
    console.log("No method stated. Try 'node start.js createdb' or 'node start.js migratedata' ")