/*
*
*
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Instantiate the HTTP Server
let httpServer = http.createServer((req,res) => {
  unifiedServer(req,res);
});

// Start the Server
httpServer.listen(config.httpPort, () => {
  console.log(`The server is listening on port ${ config.httpPort }`);
});


// Instantiate the HTTPS Server
let httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
let httpsServer = https.createServer(httpsServerOptions,(req,res) => {
  unifiedServer(req,res);
});

// Start the Server
httpsServer.listen(config.httpsPort, () => {
  console.log(`The server is listening on port ${ config.httpsPort }`);
})

// All the server logic for both the http and https Server
let unifiedServer = (req, res) => {
  // Get the URL and parse it
  let parsedUrl = url.parse(req.url, true);
  console.log(parsedUrl);

  // Get the Path
  let path = parsedUrl.pathname;
  console.log(path);
  let trimmedPath = path.replace(/^\/+|\/+$/g,'');
  console.log(trimmedPath);

  // Get the Query String as an object
  let queryStringObject = parsedUrl.query;
  console.log(queryStringObject);

  // Get the HTTP Method
  let method = req.method.toLowerCase();
  console.log(method);

  // Get the Headers as an object
  let headers = req.headers;
  console.log(headers);

  // Get the Payload, if any
  let decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();
    console.log(`The buffer: ${ buffer }`);

    // Choose the handler this request should go to. If one is not found use notFound handler
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Constructor the data  object to send to the handler
    let data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    // Route the request to the handler specific in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler or default 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler, or default to an any empty object
      payload = typeof(payload) == 'object' ? payload: {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString)
      console.log(`Returning this response: ${ statusCode } ${ payloadString }`);

    });

  });

  // Define the Handlers
  let handlers = {};

  // Sample handler
  handlers.sample = (data, callback) => {
    callback(406, { 'name': 'sample handler' });
  };

  // Hello handler
  handlers.hello = (data, callback) => {
    callback(406, { 'message': 'Hello World' });
  };

  // Sample handler
  handlers.notFound = (data, callback) => {
    callback(404);
  };

  // Define a request router
  let router = {
    'sample': handlers.sample,
    'hello': handlers.hello
  }

};
