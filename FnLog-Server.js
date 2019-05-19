#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
// @ts-ignore
var config = require("./config.json");
//import * as http from 'http'; //If using HTTP or a HTTP ReverseProxy
var https = require("https");
var express = require("express");
var commonTypes = require("./DataTypes/CommonTypes");
var MysqlConnector = require("./MySQLConnector");
var mysqlConnectionManager = new MysqlConnector.sql.MySQLConnector;
var app = express();
var options = {
    key: fs.readFileSync(config.CertPath.key),
    cert: fs.readFileSync(config.CertPath.cert)
};
//let server = http.createServer(app); //If using HTTP or a HTTP ReverseProxy
var server = https.createServer(options, app);
var io = require('socket.io')(server);
var Version = "2.0.4.0";
/**
 * Socket.io Server Handler
 * Reacts on incoming Connections
 */
io.on('connection', function (socket) {
    mysqlConnectionManager.insertServerLog(socket.id.toString(), " Connection Opened");
    /**
     * Handle incoming log requests
     */
    socket.on('log', function (logJSON) {
        try {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), " New Log: " + logJSON);
            var obj = JSON.parse(logJSON);
            var log = Object.assign(new commonTypes.ctypes.FnLog(), obj);
            if (processIncomingLog(log, socket)) {
                mysqlConnectionManager.insertIntoFnLog(log);
            }
        }
        catch (e) {
            sendSimpleResult(socket, false);
        }
    });
    /**
     * Handle incoming logPak requests
     */
    socket.on('logPak', function (logJSON) {
        mysqlConnectionManager.insertServerLog(socket.id.toString(), " New Log: " + logJSON);
        var obj = JSON.parse(logJSON);
        sendSimpleResult(socket, true);
        for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
            var logEntry = obj_1[_i];
            try {
                var log = Object.assign(new commonTypes.ctypes.FnLog(), logEntry);
                if (processIncomingLogNoSend(log, socket)) {
                    mysqlConnectionManager.insertIntoFnLog(log);
                }
            }
            catch (e) {
            }
        }
    });
    /**
     * Handles incoming logRequest
     * Sends A filtered Log, if the token is in the Database
     */
    socket.on('logRequest', function (getLogRequest) {
        try {
            var logRequest_1 = JSON.parse(getLogRequest);
            mysqlConnectionManager.insertServerLog(socket.id.toString(), " logRequest: " + getLogRequest);
            mysqlConnectionManager.checkAccessToken(logRequest_1.Token).then(function (check) {
                if (check) {
                    mysqlConnectionManager.getLogs(logRequest_1.Filter).then(function (rows) {
                        socket.emit('logRequestResult', JSON.stringify(rows));
                    });
                }
                else {
                    socket.emit('logRequestResult', "[]");
                }
            });
        }
        catch (e) {
            socket.emit('logRequestResult', "[]");
        }
    });
    /**
     * Disconnect event
     * Inserts Connection closed message into the Serverlog Table
     */
    socket.on('disconnect', function () {
        mysqlConnectionManager.insertServerLog(socket.id.toString(), "Connection Closed");
    });
});
/**
 * Entry Point of the Socket.io server
 * Starts the server and outputs Version and Port
 */
server.listen(config.ServerPort, function () {
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
function processIncomingLog(obj, socket) {
    var temp = processIncomingLogNoSend(obj, socket);
    if (temp == true) {
        sendSimpleResult(socket, true);
    }
    else {
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
function processIncomingLogNoSend(obj, socket) {
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
function sendSimpleResult(socket, res) {
    if (res === void 0) { res = false; }
    socket.emit('closer', JSON.stringify({ Result: res }));
    socket.disconnect();
}
/**
 * Checks the incoming log for the right types
 * @param {object} obj
 * @returns {boolean}
 */
function checkValues(obj) {
    return obj.ProgramName != null && obj.UUID != null &&
        obj.Title != null && obj.Description != null && obj.LogType != null &&
        obj.ProgramName.length > 0 && obj.ProgramName !== "UNDEFINED" && obj.UUID.length > 0 &&
        obj.Title.length > 0;
}
//# sourceMappingURL=FnLog-Server.js.map