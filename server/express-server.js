var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('client'));
var fs = require('fs');


var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening', host, port);
});

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-type": "application/json"
};

var resBody = {
  results: []
};

app.options('/messages', function(req, res){
  res.set(headers);
  res.status(200).end();
});

app.get('/index.html', function(req, res){
  var staticHeaders = headers;
  staticHeaders['Content-type'] = "text/html";
  res.set(staticHeaders);
  res.status(200).end();
});

app.get('/messages', function(req, res){
  res.set(headers);
  res.status(200).send(JSON.stringify(resBody));
});

app.post('/messages', function(req, res){
  res.set(headers);
  resBody.results.push(req.body);
  res.status(201).send(JSON.stringify(resBody));
});