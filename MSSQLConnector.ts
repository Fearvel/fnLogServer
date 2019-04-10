import * as mssql from 'mssql';
// @ts-ignore
import * as config from './config.json';
import {ctypes} from "./DataTypes/CommonTypes";
import FnLog = ctypes.FnLog;

export namespace sql {

    /**
     * Class for Managing The SQL Connection
     */
    export class MSSQLConnector {

        /**
         * The DB Connection
         */
        private connection: any;

        /**
         * Config, read from config.json
         */
        private MSSQLConfig = {
            server: config.MSSQLConnectionInformation.server,
            user: config.MSSQLConnectionInformation.user,
            password: config.MSSQLConnectionInformation.password,
            database: config.MSSQLConnectionInformation.database
        };

        constructor() {
            this.connection = new mssql.ConnectionPool(this.MSSQLConfig);
            this.connection.connect(err => {
                console.log(err);
            })
        }

        /**
         * Unused query function
         * Stays here as an example
         * @param sql
         * @param args
         */
         query(sql, args) {
            return new Promise((resolve, reject) => {


                this.connection.query(sql, args, (err, rows) => {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        }

        /**
         * Inserts an FnLog
         * Uses Prepared statements
         * @param log instance of FnLog
         */
        insertIntoFnLog(log: FnLog) {
            let ps = new mssql.PreparedStatement(this.connection);
            ps.input('ProgramName', mssql.NVarChar);
            ps.input('ProgramVersion', mssql.NVarChar);
            ps.input('FnLogVersion', mssql.NVarChar);
            ps.input('Title', mssql.NVarChar);
            ps.input('Description', mssql.NVarChar);
            ps.input('LogType', mssql.Int);
            ps.input('UUID', mssql.NVarChar);

            ps.prepare('Insert into Log (ProgramName, ProgramVersion, FnLogVersion, Title, Description, LogType, UUID) ' +
                'values (@ProgramName, @ProgramVersion, @FnLogVersion, @Title, @Description, @LogType, @UUID)', err => {
                ps.stream = true;

                ps.execute({
                    ProgramName: log.ProgramName, ProgramVersion: log.ProgramVersion, FnLogVersion: log.FnLogVersion,
                    Title: log.Title, Description: log.Description, LogType: log.LogType, Guid: log.UUID,
                }, (err, result) => {
                    if (err)
                        console.log(err);

                    ps.unprepare(err => {
                        // ... error checks
                    })
                })
            });
        }


        /**
         * Delivers multiple FnLogs
         * Uses Prepared statements
         * @param filter some string
         */
        getLogs(filter: string) {
            return new Promise((resolve, reject) => {
                let ps = new mssql.PreparedStatement(this.connection);
                ps.input('UUID', mssql.NVarChar);

                ps.prepare('Select * from Log where UUID like @UUID)', err => {
                    ps.stream = true;

                    ps.execute({
                    UUID:("%" + filter + "%"),
                    }, (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                        ps.unprepare(err => {
                            // ... error checks
                        })
                    })
                });

                this.connection.query("Select * from Log where UUID like ? order by id", ["%" + filter + "%"],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        checkAccessToken(token: string) {
            return new Promise((resolve, reject) => {
                let ps = new mssql.PreparedStatement(this.connection);
                ps.input('UUID', mssql.NVarChar);

                ps.prepare('Select * from Log where UUID like @UUID)', err => {
                    ps.stream = true;

                    ps.execute({
                        UUID:("%" + token + "%"),
                    }, (err, rows) => {
                        if (err)
                            return reject(err);
                        if(rows.count() == 1){
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                        ps.unprepare(err => {
                            // ... error checks
                        })
                    })
                });

            });
        }
        /**
         * Closes the DB Connection
         */
        close() {
            return new Promise((resolve, reject) => {
                this.connection.end(err => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        }
    }
}