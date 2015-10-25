/**
 * Created by panyanming on 15/10/14.
 */

var sqlite3 = require('sqlite3').verbose(),
    conf = require('../conf/conf'),
    fs = require('fs');
var exists = fs.existsSync(conf.db);
var db = new sqlite3.Database(conf.db,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
db.serialize(function(){
    db.run(
        "CREATE TABLE IF NOT EXISTS api_info "+
        "(apid INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "client CHAR(10), " +
        "name CHAR(50), " +
        "path CHAR(100), "+
        "author CHAR(50), " +
        "param VARCHAR(200), " +
        "eg TEXT, "+
        "method CHAR(10), " +
        "back CHAR(10), " +
        "active INTEGER, " +
        "time DATETIME default (datetime('now', 'localtime')))"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS api_status " +
        "(stid INTEGER PRIMARY KEY AUTOINCREMENT," +
        "target INTEGER," +
        "description CHAR(200)," +
        "code TEXT)"
    );
});
db.close();
module.exports = conf.db;

