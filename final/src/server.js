import express from 'express';
import bodyParser from 'body-parser';

var mariasql=require('mariasql')

var sql = new mariasql({
  host: '127.0.0.1',
  user: 'guest',
  password: '1234567890',
  db: 'ESfinal'
});

const server = express();
var expressWs = require('express-ws')(server);

server.use(bodyParser.json());

server.listen(3000, function () {
  console.log('listening on port 3000...');
});

server.get('/', (req, res) => {
  res.sendFile(__dirname+"/HomePage.html");
});

server.get('/bundle.js', (req, res) => {
  res.sendFile(__dirname+"/bundle.js");
});

server.post('/Login', (req, res) => {
  var q = "select * from userData where account=:account and password=:password";
  sql.query(q, {account: req.body.account, password: req.body.password},function (err,result){
    if(result.length===1){
      res.send({state:true});
    }
    else{
      res.send({state:false});
    }
  })
});

server.post('/Signup', (req, res) => {
  var q = "select * from userData where account=:account";
  sql.query(q, {account: req.body.account},function (err,result){
    if(result.length===0){
      q = "insert into userData value (:account,:password)"
      sql.query(q, {account: req.body.account, password: req.body.password});
      res.send({state:true});
    }
    else{
      res.send({state:false});
    }
  })
});

server.post('/createGroup', (req, res) => {
  console.log(req.body)
  var q = "select * from Groups where groupName=:groupName";
  sql.query(q, {groupName: req.body.groupName},function (err,result){
    if(result.length===0){
      var members = req.body.member.split(',');
      for(var i=0;i<members.length;i++){
        q = 'insert into Groups value (:groupName,:member)'
        sql.query(q, {groupName: req.body.groupName,member:members[i]});
      }
      res.send({state:true});
    }
    else{
      res.send({state:false});
    }
  })
});

server.post('/getList', (req, res) => {
  console.log(req.body)
  var q = "select * from Groups where member=:user";
  sql.query(q, {user:req.body.user},function (err,result){
    if(result.length!==0){
      res.send(result);
    }
    else{
      res.send({state:false});
    }
  })
});

server.post('/getMember', (req, res) => {
  console.log(req.body)
  var q = "select * from Groups where groupName=:groupName";
  sql.query(q, {groupName:req.body.groupName},function (err,result){
       res.send(result);
  })
});

server.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
    ws.send('123');
  });
});
