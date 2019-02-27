import * as fs from 'fs';
// @ts-ignore
import * as config from './config.json';
import * as https from 'https';
import * as express from 'express';
import * as mysql from 'mysql';

let app = express();
let options = {
    key: fs.readFileSync(config.CertPath.key),
    cert: fs.readFileSync(config.CertPath.cert)
};
let server = https.createServer(options, app);
let io = require('socket.io')(server);
let MySqlConnection = ConnectToMysql();
let Version = "T 2.0.2.0";


/**
 * Creates the MySQL Connection
 * based on the information
 * in the json config file
 * @returns {C}
 */
function ConnectToMysql() {
    let con = mysql.createConnection({
        host: config.MysqlConnectionInformation.host,
        user: config.MysqlConnectionInformation.user,
        password: config.MysqlConnectionInformation.password,
        database: config.MysqlConnectionInformation.database
    });
    return con;
}


/**
 * Socket.io Server Handler
 * Reacts on incomming Connections
 */
io.on('connection', (socket) => {
    console.log(socket.id.toString() + " Connection Opened");//Displays an Incomming Connection with id

    /**
     * Handle incoming log requests
     */
    socket.on('log', (log) => {
        console.log(socket.id.toString() + " New Log: " + log);
        let obj = JSON.parse(log);

        CheckForIncomingLogAndHandleLog(obj)

        /**
         * Prints out an message if the connection is closed
         */
        socket.on('disconnect', () => {
            console.log(socket.id.toString() + " Connection Closed");
        });
    });

    /**
     * Checks the validity of the received log via CheckValues and calls InsertIntoLogTable
     * emits negative SimpleAnswer on validity check failed and closes connection
     * @param obj
     * @constructor
     */
    function CheckForIncomingLogAndHandleLog(obj: any): void {
        if (CheckValues(obj)) {
            InsertIntoLogTable(obj);
        } else {
            socket.emit('closingAnswer', SimpleAnswer(false));
            socket.disconnect();
        }
    }

    /**
     * Inserts FnLog into the Database
     * @param obj a checked FnLog as an obj
     * @constructor
     */
    function InsertIntoLogTable(obj: any): void {
        MySqlConnection.query(
            'Insert into Log (ProgramName, ProgramVersion, FnLogVersion, Title, Description, LogType, Guid) values (?,?,?,?,?,?,?)',
            [obj.ProgramName, obj.ProgramVersion, obj.FnLogVersion, obj.Title, obj.Description, parseInt(obj.LogType), obj.Guid],
            (err, results) => {
                if (err) {
                    console.log(err);
                    socket.emit('closingAnswer', SimpleAnswer(false));
                    socket.disconnect();

                } else {
                    socket.emit('closingAnswer', SimpleAnswer(true));
                    socket.disconnect();
                }
            });
    }


    /**
     * EXPERIMENTAL
     * Handle incoming retrieve requests
     */
    socket.on('retrieve', (accessKey) => {
        console.log(socket.id.toString() + " AccessKey Received: ");
        let obj = JSON.parse(accessKey);
        GetAccessKeyAndProgress(obj);
    });

    /**
     * executes a mysql query and calls CheckAccessKeyAndProgress
     * on error emits close
     * @param obj
     * @constructor
     */
    function GetAccessKeyAndProgress(obj: any) {
        if (obj.Val != null && obj.Val.length > 0) {
            MySqlConnection.query('Select * from AccessKeys where DateofExpiry >= NOW() and AccessKey = (?)', obj.Val, (err, results) => {
                if (!err) {
                    CheckAccessKeyAndProgress(results);
                } else {
                    socket.emit('closingAnswer', SimpleAnswer(false));
                    socket.disconnect();
                }
            });
        } else {
            socket.emit('closingAnswer', SimpleAnswer(false));
            socket.disconnect();
        }
    }

    /**
     * Checks if the AccessKey is in the database
     * and emits the result
     * @param results mysql query result
     * @constructor
     */
    function CheckAccessKeyAndProgress(results: any): void {
        if (results.length >= 1) {
            console.log(socket.id.toString() + " AccessKey Accepted");
            MySqlConnection.query('Select * from Log', (err, results) => {
                if (err) {
                    console.log(err);
                    socket.emit('closingAnswer', SimpleAnswer(false));
                    socket.disconnect();
                } else {
                    socket.emit('logTable', JSON.stringify(results));
                    socket.disconnect();
                }
            });
        } else {
            console.log(err);
            console.log(socket.id.toString() + " AccessKey Declined: ");
            socket.emit('closingAnswer', SimpleAnswer(false));
            socket.disconnect();
        }
    }

    socket.on('disconnect', () => {
        console.log(socket.id.toString() + " Connection Closed");
    });
});


/**
 * Entry Point of the Socket.io server
 * Starts the server and outputs Version and Port
 */
server.listen(config.ServerPort, () => {
    console.log('fnLog Server V %s, Listening on %s', Version, config.ServerPort);
});

/**
 * Creates an SimpleAnswer out of an boolean
 * An SimpleAnswer is nothing else than an JSON
 * with the var Result that will either be True or False
 * @param {object} obj
 * @returns {boolean}
 */
function SimpleAnswer(b) {
    let s = "{\"Result\": ";
    if (b) {
        s += "\"True\"";
    } else {
        s += "\"False\"";
    }
    s += "}";
    return s;
}

/**
 * Checks the incoming log for the right types
 * @param {object} obj
 * @returns {boolean}
 */
function CheckValues(obj: any): boolean {
    if (obj.ProgramName != null && obj.ProgramName != null && obj.Guid != null &&
        obj.Title != null && obj.Description != null && obj.LogType != null &&
        obj.ProgramName.length > 0 && obj.ProgramName !== "UNDEFINED" && obj.Guid.length > 0 &&
        obj.Title.length > 0 && obj.Description.length > 0) {
        return true;
    }
    return false;
}
