var http = require("http");
var url = require('url');
var fs = require('fs');
var socket_io = require('socket.io');

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

server.listen(3000);

var server_io = socket_io.listen(server);

server_io.sockets.on('connection', function(socket)  {

  socket.on('add user',function(msg){
      socket.username = msg;
      process.stdout.write("new user:"+msg+" logged.\n");

      socket.emit('add user',{
        username: socket.username
      });
    });

  socket.on('User Login',function(userData){
      account = userData.account
      password = userData.password
      process.stdout.write( account+"\n");
      process.stdout.write( password+"\n");

    });

});