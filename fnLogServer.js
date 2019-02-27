var fs = require('fs');
var config = require('./config.json');
var https = require('https');
var express = require('express');
var mysql = require('mysql');
var app = express();
var options = {
    key: fs.readFileSync(config.CertPath.key),
    cert: fs.readFileSync(config.CertPath.cert)
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);
const MySqlConnection = ConnectToMysql();
const Version = "2.0.1.1";


function ConnectToMysql() {
    var con = mysql.createConnection({
        host: config.MysqlConnectionInformation.host,
        user: config.MysqlConnectionInformation.user,
        password: config.MysqlConnectionInformation.password,
        database: config.MysqlConnectionInformation.database
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
            MySqlConnection.query('Insert into Log (ProgramName, ProgramVersion, FnLogVersion, Title, Description, LogType, Guid) values (?,?,?,?,?,?,?)',
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
        } else {
            socket.emit('closingAnswer', SimpleAnswer(false));
            socket.disconnect();
        }
        socket.on('disconnect', () => {
            console.log(socket.id.toString() + " Connection Closed");
        });
    });

    //Acces Function for retriving the log Table
    socket.on('retrieve', (accessKey) => {
        console.log(socket.id.toString() + " AccessKey Received: ");
        var obj = JSON.parse(accessKey);
        if (obj.Val != null && obj.Val.length > 0) {
            MySqlConnection.query('Select * from AccessKeys where DateofExpiry >= NOW() and AccessKey = (?)', obj.Val, (err, results) => {
                if (!err) {
                    if (results.length >= 1) {
                        console.log(socket.id.toString() + " AccessKey Accepted");
                        MySqlConnection.query('Select * from Log', (err, results) => {
                            if (err) {
                                console.log(err);
                                socket.emit('closingAnswer', SimpleAnswer(false));
                                socket.disconnect();
                            }
                            else {
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

    });
    socket.on('disconnect', () => {
        console.log(socket.id.toString() + " Connection Closed");
    });
});

server.listen(config.ServerPort, () => {
    console.log('fnLog Server V %s, Listening on %s', Version, config.ServerPort);
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