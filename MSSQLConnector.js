"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mssql = require("mssql");
// @ts-ignore
var config = require("./config.json");
var sql;
(function (sql_1) {
    /**
     * Class for Managing The SQL Connection
     */
    var MSSQLConnector = /** @class */ (function () {
        function MSSQLConnector() {
            /**
             * Config, read from config.json
             */
            this.MSSQLConfig = {
                server: config.MSSQLConnectionInformation.server,
                user: config.MSSQLConnectionInformation.user,
                password: config.MSSQLConnectionInformation.password,
                database: config.MSSQLConnectionInformation.database
            };
            this.connection = new mssql.ConnectionPool(this.MSSQLConfig);
            this.connection.connect(function (err) {
                console.log(err);
            });
        }
        /**
         * Unused query function
         * Stays here as an example
         * @param sql
         * @param args
         */
        MSSQLConnector.prototype.query = function (sql, args) {
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
        MSSQLConnector.prototype.insertIntoFnLog = function (log) {
            var ps = new mssql.PreparedStatement(this.connection);
            ps.input('ProgramName', mssql.NVarChar);
            ps.input('ProgramVersion', mssql.NVarChar);
            ps.input('FnLogVersion', mssql.NVarChar);
            ps.input('Title', mssql.NVarChar);
            ps.input('Description', mssql.NVarChar);
            ps.input('LogType', mssql.Int);
            ps.input('UUID', mssql.NVarChar);
            ps.prepare('Insert into Log (ProgramName, ProgramVersion, FnLogVersion, Title, Description, LogType, UUID) ' +
                'values (@ProgramName, @ProgramVersion, @FnLogVersion, @Title, @Description, @LogType, @UUID)', function (err) {
                ps.stream = true;
                ps.execute({
                    ProgramName: log.ProgramName, ProgramVersion: log.ProgramVersion, FnLogVersion: log.FnLogVersion,
                    Title: log.Title, Description: log.Description, LogType: log.LogType, Guid: log.UUID,
                }, function (err, result) {
                    if (err)
                        console.log(err);
                    ps.unprepare(function (err) {
                        // ... error checks
                    });
                });
            });
        };
        /**
         * Delivers multiple FnLogs
         * Uses Prepared statements
         * @param filter some string
         */
        MSSQLConnector.prototype.getLogs = function (filter) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var ps = new mssql.PreparedStatement(_this.connection);
                ps.input('UUID', mssql.NVarChar);
                ps.prepare('Select * from Log where UUID like @UUID)', function (err) {
                    ps.stream = true;
                    ps.execute({
                        UUID: ("%" + filter + "%"),
                    }, function (err, rows) {
                        if (err)
                            return reject(err);
                        resolve(rows);
                        ps.unprepare(function (err) {
                            // ... error checks
                        });
                    });
                });
                _this.connection.query("Select * from Log where UUID like ? order by id", ["%" + filter + "%"], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MSSQLConnector.prototype.checkAccessToken = function (token) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var ps = new mssql.PreparedStatement(_this.connection);
                ps.input('UUID', mssql.NVarChar);
                ps.prepare('Select * from Log where UUID like @UUID)', function (err) {
                    ps.stream = true;
                    ps.execute({
                        UUID: ("%" + token + "%"),
                    }, function (err, rows) {
                        if (err)
                            return reject(err);
                        if (rows.count() == 1) {
                            resolve(true);
                        }
                        else {
                            resolve(false);
                        }
                        ps.unprepare(function (err) {
                            // ... error checks
                        });
                    });
                });
            });
        };
        /**
         * Closes the DB Connection
         */
        MSSQLConnector.prototype.close = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.end(function (err) {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        };
        return MSSQLConnector;
    }());
    sql_1.MSSQLConnector = MSSQLConnector;
})(sql = exports.sql || (exports.sql = {}));
//# sourceMappingURL=MSSQLConnector.js.map