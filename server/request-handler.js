

var responseBody ={
  results: []
};

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,// Seconds.
  "content-type": "text/plain"  // change to JSON?
};


var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  console.log("Serving request type " + request.method + " for url " + request.url);

  // The outgoing status.
  var statusCode = 200;
  var postCode = 201;
  var wrongCode = 404;


  if (request.method === 'POST'){
    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
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

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
};

module.exports = requestHandler;

