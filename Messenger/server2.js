var http = require("http");
var url = require('url');
var fs = require('fs');
var socket_io = require('socket.io');


console.log('Server running at http://localhost:3001')


var server = http.createServer(function(request, response) {
  console.log('A client request Registration Server Connection...');
  var path = url.parse(request.url).pathname;

  switch (path) {
    case '/':
      fs.readFile(__dirname + '/RegistrationPage.html', function(error, data) {
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

server.listen(3001);

var server_io = socket_io.listen(server);
//var writer = require('./write');
//console.log('1...');
server_io.sockets.on('connection', function(socket)  {

	socket.on('User Login',function(userData){
        account = userData.account
        password = userData.password
		process.stdout.write( account+"\n");
		process.stdout.write( password+"\n");
		//writer.write('./record.txt', account+","+password);
    });

});