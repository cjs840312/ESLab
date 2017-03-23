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
  password: '1234567890',
  db: 'mydb'
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
  
  socket.on('showFriendList',function(cookieStr){
      cookieJSON=cookie.parse(cookieStr);
      var user = cookieJSON.account;
      
      var q = 'select * from Friends where usr=:usr';
      sql.query(q, {usr: user}, function(err, result) {
        if (err) throw err;
        socket.emit('friendList', result);
      });      
  });
  
  socket.on('addFriend',function(cookieStr){
      cookieJSON=cookie.parse(cookieStr);
      var user = cookieJSON.account;
      var add = cookieJSON.receiver;
      //TODO check whether account exists
      var q = 'select * from Friends where usr=:usr and friend=:friend';
      sql.query(q, {usr: user, friend: add}, function(err, result) {
        if (err) throw err;
        if(result.length>0) console.log("already added");
        else{
          var q = 'insert into Friends values (:usr, :friend)';
          sql.query(q, {usr: user, friend: add});
          sql.query(q, {usr: add, friend: user});
          socket.emit('addLink', add);
        }
      });      
  });
});

sql.end();
