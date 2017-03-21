var http = require("http");
var socket_io = require('socket.io');
var router=require('./router')
var cookie=require('cookie')
var mariasql=require('mariasql')
console.log('Server starts...')

var server = http.createServer(router.route);
server.listen(3000);

var sql = new mariasql({
  host: '127.0.0.1',
  user: 'guest',
  password: '1234567890'
});

sql.query('use mydb', function(err, rows) {
  console.log("using mydb");
});




var server_io = socket_io.listen(server);
socketDict={}

server_io.sockets.on('connection', function(socket)  {

  socket.on('whoIsChatting',function(cookieStr){
      cookieJSON=cookie.parse(cookieStr);
      console.log(cookieJSON);

      var sender = cookieJSON.account;
      var receiver = cookieJSON.receiver;

      socketDict[sender]=socket.id;
      socket.name=sender;

      var q = 'select * from mydb.ChatHistory where (Sender like "'+sender+'" and Receiver like "'+receiver+'") or (Sender like "'+receiver+'" and Receiver like "'+sender+'") order by Time desc limit 5 ;';
      sql.query(q, function(err, rows) {
        if (err)
          console.error(err);
        console.dir(rows);
        socket.emit('chatPair',{"sender":sender,"receiver":receiver,"history":rows})
      });      
  });


  socket.on('Message',function(Data){
      var message = Data.message
      var receiver= Data.receiver
      console.log( receiver+": "+message);
      server_io.to(socketDict[receiver]).emit("Message",{sender:socket.name,message:message})

      sql.query('INSERT INTO mydb.ChatHistory value("'+socket.name+'","'+receiver+'","'+message+'",CURRENT_TIMESTAMP )', function(err, rows) {
        if (err)
          console.error(err);
        console.dir(rows);
      });

  });
});

sql.end();