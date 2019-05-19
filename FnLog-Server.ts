#!/usr/bin/env node
/**
 * FnLog Server
 * A Telemetry Server to Log any occurring errors or events
 * @author Andreas Schreiner
 * @copyright Andreas Schreiner 2019
 */
import * as fs from 'fs';
// @ts-ignore
import * as config from './config.json';
//import * as http from 'http'; //If using HTTP or a HTTP ReverseProxy
import * as https from 'https';
import * as express from 'express';
import * as commonTypes from './DataTypes/CommonTypes';
import * as MysqlConnector from './MySQLConnector';

let mysqlConnectionManager = new MysqlConnector.sql.MySQLConnector;
let app = express();
let options = {
    key: fs.readFileSync(config.CertPath.key),
    cert: fs.readFileSync(config.CertPath.cert)
};
//let server = http.createServer(app); //If using HTTP or a HTTP ReverseProxy
let server = https.createServer(options, app);

let io = require('socket.io')(server);
const Version = "2.0.4.0";


/**
 * Socket.io Server Handler
 * Reacts on incoming Connections
 */
io.on('connection', (socket) => {

    mysqlConnectionManager.insertServerLog(socket.id.toString(), " Connection Opened");

    /**
     * Handle incoming log requests
     */
    socket.on('log', (logJSON) => {
        try {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), " New Log: " + logJSON);
            let obj = JSON.parse(logJSON);
            let log = Object.assign(new commonTypes.ctypes.FnLog(), obj);

            if (processIncomingLog(log, socket)) {
                mysqlConnectionManager.insertIntoFnLog(log);
            }
        } catch (e) {
            sendSimpleResult(socket, false);
        }
    });

    /**
     * Handle incoming logPak requests
     */
    socket.on('logPak', (logJSON) => {
        mysqlConnectionManager.insertServerLog(socket.id.toString(), " New Log: " + logJSON);
        let obj = JSON.parse(logJSON);
        sendSimpleResult(socket, true);
        for (let logEntry of obj) {
            try {
                let log = Object.assign(new commonTypes.ctypes.FnLog(), logEntry);
                if (processIncomingLogNoSend(log, socket)) {
                    mysqlConnectionManager.insertIntoFnLog(log);
                }
            } catch (e) {
            }
        }
    });


    /**
     * Handles incoming logRequest
     * Sends A filtered Log, if the token is in the Database
     */
    socket.on('logRequest', (getLogRequest) => {
        try {
            let logRequest = JSON.parse(getLogRequest);
            mysqlConnectionManager.insertServerLog(socket.id.toString(), " logRequest: " + getLogRequest);
            mysqlConnectionManager.checkAccessToken(logRequest.Token).then(check => {
                    if (check) {
                        mysqlConnectionManager.getLogs(logRequest.Filter).then(rows => {
                            socket.emit('logRequestResult', JSON.stringify(rows));
                        });
                    } else {
                        socket.emit('logRequestResult', "[]");
                    }
                }
            )
        } catch (e) {
            socket.emit('logRequestResult', "[]");
        }
    });

    /**
     * Disconnect event
     * Inserts Connection closed message into the Serverlog Table
     */
    socket.on('disconnect', () => {
        mysqlConnectionManager.insertServerLog(socket.id.toString(), "Connection Closed");
    });
});

/**
 * Entry Point of the Socket.io server
 * Starts the server and outputs Version and Port
 */
server.listen(config.ServerPort, () => {
    mysqlConnectionManager.insertServerLog("", "fnLog Server: " +
        Version + " Listening on: " + config.ServerPort);
    console.log('fnLog Server V %s, Listening on %s', Version, config.ServerPort);
});

/**
 * Checks the validity of the received log via checkValues and calls insertIntoLogTable
 * emits negative SimpleAnswer on validity check failed and closes connection
 * @param obj the Log information
 * @param socket server socket
 */
function processIncomingLog(obj: commonTypes.ctypes.FnLog, socket: any): boolean {
    let temp = processIncomingLogNoSend(obj, socket);
    if (temp == true) {
        sendSimpleResult(socket, true);
    } else {
        sendSimpleResult(socket);
    }
    return temp;
}

/**
 * Checks the validity of the received log via checkValues and calls insertIntoLogTable
 * emits nothing.
 * @param obj the Log information
 * @param socket server socket
 */
function processIncomingLogNoSend(obj: commonTypes.ctypes.FnLog, socket: any): boolean {
    if (!checkValues(obj)) {
        return false;
    }
    return true;
}

/**
 * Sends a SimpleResult
 * @param socket
 * @param res
 * @constructor
 */
function sendSimpleResult(socket, res: boolean = false): void {
    socket.emit('closer', JSON.stringify({Result: res}));
    socket.disconnect();
}

/**
 * Checks the incoming log for the right types
 * @param {object} obj
 * @returns {boolean}
 */
function checkValues(obj: any): boolean {
    return obj.ProgramName != null && obj.UUID != null &&
        obj.Title != null && obj.Description != null && obj.LogType != null &&
        obj.ProgramName.length > 0 && obj.ProgramName !== "UNDEFINED" && obj.UUID.length > 0 &&
        obj.Title.length > 0;
}