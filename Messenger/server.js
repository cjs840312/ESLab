var http = require("http");
var url = require('url');
var fs = require('fs');
var socket_io = require('socket.io');
var querystring = require('querystring');

console.log('Server starts...')

var server = http.createServer(function(request, response) {
  console.log("Connect from: " + request.connection.remoteAddress);
  var path = url.parse(request.url).pathname;

  switch (path) {
    case '/':
      fs.readFile(__dirname + '/HomePage.html', function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("HomePage doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    case '/MainBoard.html':
      fs.readFile(__dirname + path, function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    case '/Chat.html':
      fs.readFile(__dirname + path, function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    case '/login':
      formData = '';
      request.on("data", function(data) {
        formData += data;
      });
      request.on("end", function() {
        var user;
        user = querystring.parse(formData);
        console.log(user.account)
        console.log(user.password)});
      break;
    default:
      response.writeHead(404);
      response.write("opps this doesn't exist - 404");
      response.end();
      break;
  }
});

server.listen(3000);

var server_io = socket_io.listen(server);

server_io.sockets.on('connection', function(socket)  {

  socket.on('Send Message',function(Data){
      var message = Data.message
      process.stdout.write( message+"\n");
    });

});