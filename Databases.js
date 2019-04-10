"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mssql = require("mssql");
// @ts-ignore
var config = require("./config.json");
/**
 * Loads the Connection data from fields of a parsed JSON file
 */
var MSSQLConfig = {
    server: config.MSSQLConnectionInformation.server,
    user: config.MSSQLConnectionInformation.user,
    password: config.MSSQLConnectionInformation.password,
    database: config.MSSQLConnectionInformation.database
};
var fnlog;
(function (fnlog) {
    // @ts-ignore
    var connectionPool = new mssql.ConnectionPool(MSSQLConfig);
    connectionPool.connect(function (err) {
        // ...
    });
    function insertIntoFnLogTable(log) {
        var ps = new mssql.PreparedStatement(connectionPool);
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
                // ... error checks
                ps.unprepare(function (err) {
                    // ... error checks
                });
            });
        });
    }
    fnlog.insertIntoFnLogTable = insertIntoFnLogTable;
    function getFnLogTable(filter) {
        return new Promise(function (resolve, reject) {
            var ps = new mssql.PreparedStatement(connectionPool);
            ps.input('UUID', mssql.NVarChar);
            ps.prepare('Select * from Log where UUID like %@UUID%', function (err) {
                ps.stream = true;
                ps.execute({
                    UUID: filter
                }, function (err, result) {
                    if (err)
                        return reject(err);
                    resolve(result);
                    ps.unprepare(function (err) {
                        // ... error checks
                    });
                });
            });
        });
    }
    fnlog.getFnLogTable = getFnLogTable;
})(fnlog = exports.fnlog || (exports.fnlog = {}));
//# sourceMappingURL=Databases.js.map