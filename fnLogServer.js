var http = require('http')
var https = require('https');
var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var serverTools = require('./fnServerTools');
var typeTools = require('./fnTypeTools');

const Version = "1.0.2.0";
const HttpPort = 9023;
const HttpsPort = 9024;

const options = {
    key: fs.readFileSync("testKey.pem"),
    cert: fs.readFileSync("testCert.pem")
};

const app = express();
const http_server = require('http').createServer(app);
const https_server = require('https').createServer(options,app);

const MySqlConnection = ConnectToMysql();

http_server.listen(HttpPort, () => console.log(GetStartInfo("[HTTP]", HttpPort)));
https_server.listen(HttpsPort,() => console.log(GetStartInfo("[HTTPS]", HttpsPort)));

app.post('/sendLog', function (req, res) {
    RetrieveLog(req, res);
});

function GetStartInfo(s, port) {
    return "[" + typeTools.GetDateTimeNow() + "] [fnLog Version: " + Version + "] Server Started. on Port: " + port + "\t" + s;
}

function ConnectToMysql() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "testuser",
        password: "password"
    });
    return con;
}

function RetrieveLog(req, res) {
    if (req.method === "POST") {
        var c = req.socket.encrypted ? "[HTTPS]" : "[HTTP]";
        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
            console.log("[" + typeTools.GetDateTimeNow() + "] "+ c + " " + "New Log Arrived: "  + body);
        });
        req.on("end", function () {
            res.writeHead(200, {"Content-Type": "text/html"});
            var obj = JSON.parse(typeTools.TransformToJson(body));
            if (obj.ProgramName != null && obj.ProgramName != null && obj.GUID != null &&
                obj.Title != null && obj.Description != null && obj.LogType != null &&
                obj.ProgramName.length > 0 && obj.ProgramName !== "UNDEFINED" && obj.GUID.length > 0 &&
                obj.Title.length > 0 && obj.Description.length > 0 && obj.LogType.length > 0 && typeTools.IsNumber(obj.LogType)) {
                MySqlConnection.query('Insert into fnLog.Log (ProgramName,Guid, Title,Description, LogType) values (?,?,?,?,?)',
                    [obj.ProgramName, obj.GUID, obj.Title, obj.Description, parseInt(obj.LogType)],
                    function (error, results, fields) {
                        if (error) {
                            res.end(serverTools.CreateSimpleAnswer(false));

                        } else {
                            res.end(serverTools.CreateSimpleAnswer(true));
                        }
                    });
            } else {
                res.end(serverTools.CreateSimpleAnswer(false));
            }
        });
    }
    else {
        res.end(serverTools.CreateSimpleAnswer(false));
    }
}