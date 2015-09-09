

var responseBody ={
  results: []
};

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,// Seconds.
  "content-type": "application/json" 
};

var requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode = 200;
  var postCode = 201;
  var wrongCode = 404;

  if (request.method === 'POST'){

    request.on('data', function(messageChunk){
      responseBody.results.push(JSON.parse(messageChunk.toString()));
    });

    request.on('end', function(message){
      response.writeHead(postCode, headers);
      response.end(JSON.stringify(responseBody));
    });
  }
  else if (request.method === 'GET') {
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(responseBody));
  }
  else if (request.method === 'OPTIONS') {
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(responseBody));
  }
  else {
    response.writeHead(wrongCode, headers);
    response.end();
  }
};

module.exports = requestHandler;

