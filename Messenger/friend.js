var Client = require('mariasql');
var c = new Client({
  host: '127.0.0.1',
  user: 'root',
  password: 'sharon84'
});
console.log("sql connected");

c.query('SHOW DATABASES', function(err, rows){
  if(err) throw err;
  console.log(rows);
});

c.end();

