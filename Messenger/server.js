var http = require("http");
var socket_io = require('socket.io');
var router=require('./router')

console.log('Server starts...')

var server = http.createServer(router.route);

server.listen(3000);

var server_io = socket_io.listen(server);

server_io.sockets.on('connection', function(socket)  {

  socket.on('Send Message',function(Data){
      var message = Data.message
      process.stdout.write( message+"\n");
    });

});