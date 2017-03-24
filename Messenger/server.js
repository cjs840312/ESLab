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
  socket.on('checkLogin', function(cookieStr){
    cookieJSON = cookie.parse(cookieStr);
    var account = cookieJSON.account;
    if(account == undefined) socket.emit('notLogin', "Please login!");
  });

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
        
      socket.broadcast.emit('whoIsOnline', sender);

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
      
      socketDict[user] = socket.id;
      socket.name = user;
      
      var q = 'select friend from Friends where usr=:usr';
      sql.query(q, {usr: user}, function(err, result) {
        if (err) throw err;
        var isOnline = [];
        for (i=0; i<result.length; ++i){
          if(socketDict[result[i].friend] != undefined) isOnline.push(true);
          else isOnline.push(false);
        }
        socket.emit('friendList', {friendList: result, onlineList: isOnline});
      });      

      socket.broadcast.emit('whoIsOnline', user);
  });
  
  socket.on('addFriend',function(cookieStr){
    cookieJSON=cookie.parse(cookieStr);
    var user = cookieJSON.account;
    var add = cookieJSON.receiver;
      
    if(user==add) socket.emit('errMessage', "Can't add yourself!");
    else{      
      var q = 'select * from UserInfo where Account=:Account';
      sql.query(q, {Account: add}, function(err, result) {
        if(err) throw err;
      	if(!result.length>0) socket.emit('errMessage', "No such user!"); 
        else{
          q = 'select * from Friends where usr=:usr and friend=:friend';
          sql.query(q, {usr: user, friend: add}, function(err, result) {
            if (err) throw err;
            if(result.length>0) socket.emit('errMessage', "Already added!");
            else{  
              q = 'insert into Friends values (:usr, :friend)';
              sql.query(q, {usr: user, friend: add});
              sql.query(q, {usr: add, friend: user});
              var isOnline;
              if(socketDict[add]!=undefined) isOnline = true;
              else isOnline = false;
              socket.emit('addLink', {add: add, isOnline: isOnline});
              if(isOnline)
                server_io.to(socketDict[add]).emit("addLink",{add: user, isOnline: true});
            }
          });
        }
      });
    }
  });
  
  socket.on('disconnect', function(){
    socket.broadcast.emit("whoIsOffline", socket.name); 
    delete socketDict[socket.name];
  });
});

sql.end();
