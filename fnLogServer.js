var fs = require('fs');
var https = require('https');
var express = require('express');
var mysql = require('mysql');
var app = express();
var options = {
    key: fs.readFileSync('./testKey.pem'),
    cert: fs.readFileSync('./testCert.pem')
};
var serverPort = 6544;
var server = https.createServer(options, app);
var io = require('socket.io')(server);
const MySqlConnection = ConnectToMysql();
const Version = "2.0.0.0";

function ConnectToMysql() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "testuser",
        password: "testpassword",
        database: "fnlog"
    });
    return con;
}

io.on('connection', (socket) => {
 //   socket.emit('info', Version);
    console.log(socket.id.toString() + " Connection Opened");

    //LOG Function
    socket.on('log', (log) => {
        console.log(socket.id.toString() + " New Log: " + log);
        var obj = JSON.parse(log);
        if (CheckValues(obj)) {
            MySqlConnection.query('Insert into log (ProgramName, Guid, Title, Description, LogType) values (?,?,?,?,?)',
                [obj.ProgramName, obj.Guid, obj.Title, obj.Description, parseInt(obj.LogType)],
                (err, results) => {
                    if (err) {
                        socket.emit('closingAnswer', SimpleAnswer(false));
                        socket.disconnect();

                    } else {
                        socket.emit('closingAnswer', SimpleAnswer(true));
                        socket.disconnect();
                    }
                });
        } else {
            socket.emit('closingAnswer', SimpleAnswer(false));
            socket.disconnect();
        }
    });

    //Acces Function for retriving the log Table
    socket.on('retrieve', (accessKey) => {
        console.log(socket.id.toString() + " AccessKey Received: ");
        var obj = JSON.parse(accessKey);
        if (obj.Val != null && obj.Val.length >0){
            MySqlConnection.query('Select * from accesskeys where DateofExpiry >= NOW() and AccessKey = (?)', obj.Val, (err, results) => {
                if (!err) {
                    if (results.length >= 1) {
                        console.log(socket.id.toString() + " AccessKey Accepted");
                        MySqlConnection.query('Select * from log', (err, results) => {
                            socket.emit('LogTable', JSON.stringify(results));
                            socket.disconnect();
                        });
                    } else {
                        console.log(socket.id.toString() + " AccessKey Declined: ");
                        socket.emit('closingAnswer', SimpleAnswer(false));
                        socket.disconnect();
                    }
                } else {
                    socket.emit('closingAnswer', SimpleAnswer(false));
                    socket.disconnect();
                }
            });
        }
        else {
            socket.emit('closingAnswer', SimpleAnswer(false));
            socket.disconnect();
        }
        socket.on('disconnect', () => {
            console.log(socket.id.toString() + " Connection Closed");
        });
    });
});

server.listen(serverPort, () => {
    console.log('fnLog Server V %s, Listening on %s',Version , serverPort);
});

function SimpleAnswer(b) {
    var s = "{\"Result\": ";
    if (b) {
        s += "\"True\"";
    } else {
        s += "\"False\"";
    }
    s += "}";
    return s;
}

function CheckValues(obj) {
    if (obj.ProgramName != null && obj.ProgramName != null && obj.Guid != null &&
        obj.Title != null && obj.Description != null && obj.LogType != null &&
        obj.ProgramName.length > 0 && obj.ProgramName !== "UNDEFINED" && obj.Guid.length > 0 &&
        obj.Title.length > 0 && obj.Description.length > 0) {
        return true;
    }
    return false;
}