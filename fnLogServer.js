// Node.js: HTTP SERVER Handling GET and POST Request
// Show HTML Form at GET request.
// At POST Request: Grab form data and display them.
// Get Complete Source Code from Pabbly.com

var http = require('http')
var https = require('https');
var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require("body-parser");

const Version = "1.0.1.0";
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
const ConnectionType = {HTTP: 1, HTTPS: 2};

http_server.listen(HttpPort, () => console.log(GetStartInfo(ConnectionType.HTTP, HttpPort)));
https_server.listen(HttpsPort,() => console.log(GetStartInfo(ConnectionType.HTTPS, HttpsPort)));

app.post('/sendLog', function (req, res) {
    RetrieveLog(req, res);
});

function GetStartInfo(c, port) {
    return "[fnLog Version: " + Version + "]\n[" + GetDateTime() + "] Server Started. on Port: " + port + "\t" + GetConnectionTypeString(c);
}

function GetConnectionTypeString(c) {
    if (c === ConnectionType.HTTP) {
        return "[HTTP]";
    } else {
        return "[HTTPS]";
    }
}

function ConnectToMysql() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "testuser",
        password: "password"
    });
    return con;
}

function TransformToJson(s) {
    s = "{\n\t\"" + s;
    while (s.includes("=")) {
        s = s.replace("=", "\": \"");
    }
    while (s.includes("\&")) {
        s = s.replace("\&", "\",\n\t\"");
    }
    s = s + "\"\n}";
    return s;
}

function CreateAnswer(b) {
    var s = "{\"Result\": ";
    if (b) {
        s += "\"True\"";
    } else {
        s += "\"False\"";
    }
    s += "}";
    return s;
}

function GetDateTime() {
    var currentdate = new Date();
    var datetime =
        +currentdate.getFullYear() + "-"
        + (currentdate.getMonth() + 1) + "-"
        + currentdate.getDate() + " "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    return datetime;
}

function IsNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function RetrieveLog(req, res) {
    if (req.method === "POST") {
        var c = req.socket.encrypted ? ConnectionType.HTTPS : ConnectionType.HTTP;
        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
            console.log("[" + GetDateTime() + "] "+ GetConnectionTypeString(c) + " " + "New Log Arrived: "  + body);
        });
        req.on("end", function () {
            res.writeHead(200, {"Content-Type": "text/html"});
            var obj = JSON.parse(TransformToJson(body));
            if (obj.ProgramName != null && obj.ProgramName != null && obj.GUID != null &&
                obj.Title != null && obj.Description != null && obj.LogType != null &&
                obj.ProgramName.length > 0 && obj.ProgramName !== "UNDEFINED" && obj.GUID.length > 0 &&
                obj.Title.length > 0 && obj.Description.length > 0 && obj.LogType.length > 0 && IsNumber(obj.LogType)) {
                MySqlConnection.query('Insert into fnLog.Log (ProgramName,Guid, Title,Description, LogType) values (?,?,?,?,?)',
                    [obj.ProgramName, obj.GUID, obj.Title, obj.Description, parseInt(obj.LogType)],
                    function (error, results, fields) {
                        if (error) {
                            res.end(CreateAnswer(false));

                        } else {
                            res.end(CreateAnswer(true));
                        }
                    });
            } else {
                res.end(CreateAnswer(false));
            }
        });
    }
    else {
        res.end(CreateAnswer(false));
    }
}




    