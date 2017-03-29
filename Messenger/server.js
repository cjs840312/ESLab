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

      var q = 'select * from ChatHistory where (Sender like "'+sender+'" and Receiver like "'+receiver+'") or (Sender like "'+receiver+'" and Receiver like "'+sender+'") order by Time desc limit 5 ;';
      sql.query(q, function(err, rows) {
        if (err)
          console.error(err);
        socket.emit('chatPair',{"sender":sender,"receiver":receiver,"history":rows})
      });   
        
      q = 'update ChatHistory set IsRead=true where Sender=:sender and Receiver=:receiver';
      sql.query(q, {sender: receiver, receiver: sender});
      
      socket.broadcast.emit('whoIsOnline', sender);

  });

  socket.on('Message',function(Data){
      var message = Data.message
      var receiver= Data.receiver
      console.log( receiver+": "+message);
      server_io.to(socketDict[receiver]).emit("Message",{sender:socket.name,message:message})

      sql.query('INSERT INTO mydb.ChatHistory value("'+socket.name+'","'+receiver+'","'+message+'",CURRENT_TIMESTAMP, false)', function(err, rows) {
        if (err)
          console.error(err);
      });
      
      var Msg = message;
      if(message.length>20) Msg = Msg.slice(0,20)+"...";
      server_io.to(socketDict[receiver]).emit("Preview",{friend: socket.name, Msg:Msg, IsRead: false});
  });
  socket.on('SignUp', function(userInfo){
     var username = userInfo.username;
     console.log(username+' has signed up...');
     var account = userInfo.account;
     var password = userInfo.password;
     sql.query('INSERT INTO mydb.UserInfo value("'+username+'","'+account+'","'+password+'")',function(err, rows){
        if(err)
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
              server_io.to(socketDict[add]).emit("addLink",{add: user, isOnline: true});
            }
          });
        }
      });
    }
  });

  socket.on('showPreview', function(friend){
    var user = socket.name;
    var q = 'select * from ChatHistory where (Sender=:sender and Receiver=:receiver) or (Sender=:receiver and Receiver=:sender) order by Time desc limit 1';
    sql.query(q, {sender: user, receiver: friend}, function(err, result){
      if(result.length>0){
        var Msg = result[0].Content;
        var IsRead = result[0].IsRead;
        if(Msg.length>20) Msg = Msg.slice(0,20)+"...";
        if(result[0].Sender==user) 
          socket.emit('Preview', {friend: friend, Msg: 'You: '+Msg, IsRead: true});
        else socket.emit('Preview', {friend: friend, Msg: Msg, IsRead: IsRead});
      }
      else socket.emit('Preview', {friend: friend, Msg:'Start Chatting!', IsRead: true});
    });
  });

  socket.on('IsRead', function(sender){
      q = 'update ChatHistory set IsRead=true where Sender=:sender and Receiver=:receiver';
      sql.query(q, {sender: sender, receiver: socket.name});
      server_io.to(socketDict[sender]).emit("Read"," I read it ");
  });
  
  socket.on('disconnect', function(){
    socket.broadcast.emit("whoIsOffline", socket.name); 
    delete socketDict[socket.name];
  });
});

sql.end();
