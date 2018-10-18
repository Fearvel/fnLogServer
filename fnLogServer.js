//import the express module
var express = require('express');

//import body-parser
var bodyParser = require('body-parser');

//store the express in a variable
var app = express();

//configure body-parser for express
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//allow express to access our html (index.html) file
app.get('/index.html', function(req, res) {
    res.sendFile(__dirname + "/" + "index.html");
});

//route the GET request to the specified path, "/user".
//This sends the user information to the path
app.post('/user', function(req, res){
    response = {
        Guid : req.body.Guid,
        Title : req.body.Title,
        Description: req.body.Description,
        LogType: req.body.LogType,
        DateOfIncident: req.body.DateOfIncident

    };

    //this line is optional and will print the response on the command prompt
    //It's useful so that we know what infomration is being transferred
    //using the server
    console.log(response);

    //convert the response in JSON format
    res.end(JSON.stringify(response));
});

//This piece of code creates the server
//and listens to the request at port 8888
//we are also generating a message once the
//server is created
var server = app.listen(8888, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});