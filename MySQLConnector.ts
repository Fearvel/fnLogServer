import * as mysql from 'mysql';
// @ts-ignore
import * as config from './config.json';
import {ctypes} from "./DataTypes/CommonTypes";
import FnLog = ctypes.FnLog;

export namespace sql {

    /**
     * Class for Managing The SQL Connection
     */
    export class MySQLConnector {

        /**
         * The DB Connection
         */
        private connection: any;

        /**
         * Config, read from config.json
         */
        private MySQLConfig = {
            host: config.MySQLConnectionInformation.host,
            user: config.MySQLConnectionInformation.user,
            password: config.MySQLConnectionInformation.password,
            database: config.MySQLConnectionInformation.database
        };

        constructor() {
            this.connection = mysql.createConnection(this.MySQLConfig);
        }

        /**
         * Unused query function
         * Stays here as an example
         * @param sql
         * @param args
         */
        private query(sql, args) {
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
            this.connection.query("Insert into Log (" +
                " `UUID`," +
                " `ProgramName`," +
                " `ProgramVersion`," +
                " `FnLogClientVersion`," +
                " `Title`, " +
                "`Description`," +
                "`LogType`) values (?, ?, ?, ?, ?, ?, ?) ",
                [log.UUID,
                    log.ProgramName,
                    log.ProgramVersion,
                    log.FnLogClientVersion,
                    log.Title,
                    log.Description,
                    log.LogType]
                , (err) => {
                    if (err)
                        console.log(err);
                });
        }

        /**
         * Delivers multiple FnLogs
         * Uses Prepared statements
         * @param filter some string
         */
        getLogs(filter: string) {
            return new Promise((resolve, reject) => {
                this.connection.query("Select * from Log where UUID like ? order by id", ["%" + filter + "%"],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        /**
         * Checks an Token
         * returns an boolean
         * @param token a tokenString
         */
        checkAccessToken(token: string): Promise<boolean> {
            return new Promise((resolve, reject) => {
                this.connection.query("Select * from AccessToken where Token = ?",
                    [token],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        if (rows.length == 1) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
            });
        }

        /**
         * Inserts the Log of the Server
         * @param socketId
         * @param message
         */
        insertServerLog(socketId: string, message: string) {
            this.connection.query("INSERT INTO `ServerLog`" +
                "(" +
                "`SocketId`," +
                "`Message`)" +
                "VALUES" +
                "(?, ?)",
                [socketId, message]
                , (err) => {
                    if (err)
                        console.log(err);
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