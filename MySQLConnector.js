"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
// @ts-ignore
var config = require("./config.json");
var sql;
(function (sql_1) {
    /**
     * Class for Managing The SQL Connection
     */
    var MySQLConnector = /** @class */ (function () {
        function MySQLConnector() {
            /**
             * Config, read from config.json
             */
            this.MySQLConfig = {
                host: config.MySQLConnectionInformation.host,
                user: config.MySQLConnectionInformation.user,
                password: config.MySQLConnectionInformation.password,
                database: config.MySQLConnectionInformation.database
            };
            this.connection = mysql.createConnection(this.MySQLConfig);
        }
        /**
         * Unused query function
         * Stays here as an example
         * @param sql
         * @param args
         */
        MySQLConnector.prototype.query = function (sql, args) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query(sql, args, function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         * Inserts an FnLog
         * Uses Prepared statements
         * @param log instance of FnLog
         */
        MySQLConnector.prototype.insertIntoFnLog = function (log) {
            this.connection.query("Insert into Log (" +
                " `UUID`," +
                " `ProgramName`," +
                " `ProgramVersion`," +
                " `FnLogVersion`," +
                " `Title`, " +
                "`Description`," +
                "`LogType`) values (?, ?, ?, ?, ?, ?, ?) ", [log.UUID,
                log.ProgramName,
                log.ProgramVersion,
                log.FnLogVersion,
                log.Title,
                log.Description,
                log.LogType], function (err, rows) {
                if (err)
                    console.log(err);
            });
        };
        /**
         * Delivers multiple FnLogs
         * Uses Prepared statements
         * @param filter some string
         */
        MySQLConnector.prototype.getLogs = function (filter) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("Select * from Log where UUID like ? order by id", ["%" + filter + "%"], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         * Checks an Token
         * returns an boolean
         * @param token a tokenString
         */
        MySQLConnector.prototype.checkAccessToken = function (token) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("Select * from AccessToken where Token = ?", [token], function (err, rows) {
                    if (err)
                        return reject(err);
                    if (rows.length == 1) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        };
        /**
         * Inserts the Log of the Server
         * @param socketId
         * @param message
         */
        MySQLConnector.prototype.insertServerLog = function (socketId, message) {
            this.connection.query("INSERT INTO `ServerLog`" +
                "(" +
                "`SocketId`," +
                "`Message`)" +
                "VALUES" +
                "(?, ?)", [socketId, message], function (err) {
                if (err)
                    console.log(err);
            });
        };
        /**
         * Closes the DB Connection
         */
        MySQLConnector.prototype.close = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.end(function (err) {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        };
        return MySQLConnector;
    }());
    sql_1.MySQLConnector = MySQLConnector;
})(sql = exports.sql || (exports.sql = {}));
//# sourceMappingURL=MySQLConnector.js.map