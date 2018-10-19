// Node.js: HTTP SERVER Handling GET and POST Request
// Show HTML Form at GET request.
// At POST Request: Grab form data and display them.
// Get Complete Source Code from Pabbly.com


var http = require('http');
var fs = require('fs');
var mysql = require('mysql');


let con = ConnectToMysql();

var server = http.createServer(function (req, res) {
    if (req.method === "POST") {
        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
            console.log("[" +  GetDateTime() + "] " + "New Log Arrived: " + body);
        });
        req.on("end", function () {
            res.writeHead(200, {"Content-Type": "text/html"});
            var obj = JSON.parse(TransformToJson(body));
            if (obj.ProgramName != null&& obj.ProgramName != null && obj.GUID != null &&
                obj.Title != null && obj.Description != null && obj.LogType != null &&
                obj.ProgramName.length > 0 && obj.ProgramName != "UNDEFINED" && obj.GUID.length > 0 &&
                obj.Title.length > 0 && obj.Description.length >0 && obj.LogType.length > 0 && IsNumber(obj.LogType) ) {
                con.query('Insert into fnLog.Log (ProgramName,Guid, Title,Description, LogType) values (?,?,?,?,?)',
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

}).listen(8888);

function IsNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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

function CreateAnswer(b){
    var s = "{\"Result\": ";
    if (b){
        s+= "\"True\"";
    } else{
        s+= "\"False\"";
    }
    s+= "}";
    return s;
}



function ConnectToMysql() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "testuser",
        password: "password"
    });
    return con;
}
function GetDateTime() {
    var currentdate = new Date();
    var datetime =
        + currentdate.getFullYear() + "-"
        + (currentdate.getMonth()+1)  + "-"
        + currentdate.getDate() + " "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    return datetime;
}


    