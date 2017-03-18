var url = require('url');
var fs = require('fs');
var querystring = require('querystring');

var router=exports;

function toHTML(path,response){
  fs.readFile(__dirname + path, function(error, data) {
    if (error){
      response.writeHead(404);
      response.write("opps this doesn't exist - 404");
    } else {
      response.writeHead(200, {"Content-Type": "text/html"});

      response.write(data, "utf8");
    }
    response.end();
  });
}

router.route=function route(request,response){
  console.log("Connect from: " + request.connection.remoteAddress);
  var path = url.parse(request.url).pathname;

  switch (path) {
    case '/':
      toHTML("/HomePage.html",response);
      break;
    case '/RegistrationPage.html':
    case '/MainBoard.html':
    case '/Chat.html':
      toHTML(path,response);
      break;
    case '/login':
      formData = '';
      request.on("data", function(data) {
        formData += data;
      });
      request.on("end", function() {
        var user;
        user = querystring.parse(formData);
        console.log(user.account)
        console.log(user.password)});
      break;
    case '/add':
      formData = '';
      request.on("data", function(data) {
        formData += data;
      });
      request.on("end", function() {
        var user;
        user = querystring.parse(formData);
        console.log(user.account); 
        toHTML("/MainBoard.html",response); });
      break;

    default:
      error404(response);
      break;
  }
}

