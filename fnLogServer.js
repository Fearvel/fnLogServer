// Node.js: HTTP SERVER Handling GET and POST Request
// Show HTML Form at GET request.
// At POST Request: Grab form data and display them.
// Get Complete Source Code from Pabbly.com


var http = require('http');
var fs = require('fs');
var mysql = require('mysql');

var server = http.createServer(function (req, res) {
    var con = ConnectToMysql();


    if (req.method === "POST") {
        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
            console.log(body);

        });


        req.on("end", function () {
            res.writeHead(200, {"Content-Type": "text/html"});
            var obj = JSON.parse(TransformToJson(body));
            con.query('Insert into fnLog.Log (ProgramName,Guid, Title,Description, LogType) values (?,?,?,?,?)', [obj.ProgramName, obj.GUID, obj.Title, obj.Description, parseInt(obj.LogType)], function (error, results, fields) {
                if (error) {
                    res.end(CreateAnswer(false));
                    console.log(CreateAnswer(false));

                } else {
                    res.end(CreateAnswer(true));
                    console.log(CreateAnswer(true));

                }
            });
        });
    }
    else {
        res.end(CreateAnswer(false));
        console.log(CreateAnswer(false));

    }

}).listen(8888);

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
    var s = "{\"result\": ";
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


    