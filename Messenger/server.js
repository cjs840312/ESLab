var http = require("http");
var socket_io = require('socket.io');
var router=require('./router')

console.log('Server starts...')

var server = http.createServer(router.route);

server.listen(3000);

var server_io = socket_io.listen(server);

socketDict={}

server_io.sockets.on('connection', function(socket)  {

  socket.on('myName',function(name){
      socket.name = name;
      socketDict[name]=socket.id
      console.log(name);
  });


  socket.on('Message',function(Data){
      var message = Data.message
      var receiver= Data.receiver
      console.log( receiver+": "+message);
      server_io.to(socketDict[receiver]).emit("Message",{sender:socket.name,message:message})
  });

});