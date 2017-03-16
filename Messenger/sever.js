var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');

console.log('Server starts...')

var server = http.createServer(function(request, response) {
  console.log('Connection');
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
    default:
      response.writeHead(404);
      response.write("opps this doesn't exist - 404");
      response.end();
      break;
  }
});

server.listen(8001);
io.listen(server);