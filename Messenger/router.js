var url = require('url');
var fs = require('fs');
var querystring = require('querystring');

var router=exports;

function error404(response){
  response.writeHead(404);
  response.write("opps this doesn't exist - 404");
  response.end();
}

function toHTML(path,response){
  fs.readFile(__dirname + path, function(error, data) {
    if (error){
      error404(response);
    } else {
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write(data, "utf8");
      response.end();
    }
  });
}

router.route=function route(request,response){
  console.log("Connect from: " + request.connection.remoteAddress);
  var path = url.parse(request.url).pathname;

  switch (path) {
    case '/':
      fs.readFile(__dirname + "/HomePage.html", function(error, data) {
        if (error){
          error404(response);
        } else {
          response.writeHead(200, {"Content-Type": "text/html",'Set-Cookie': "account=; expires="+ new Date(0)});
          response.write(data, "utf8");
          response.end();
        }
      });
      break;
    case '/RegistrationPage.html':
    case '/MainBoard.html':
    case '/Chat.html':
      toHTML(path,response);
      break;
//    case '/login':
      /*
      formData = '';
      request.on("data", function(data) { formData += data;});
      request.on("end", function() {
        var user;
        user = querystring.parse(formData);
        account=user.account;
        password=user.password;
        //console.log("yeahhhhhhh");
        console.log(account);
        console.log(password);
        if(account = "123"){
           console.log("123 tries to log in...");
        }
        else{
           console.log("non-123 tries to log in...");
        }
        response.writeHead(303, {"Location": "./MainBoard.html","Content-Type": "text/html",'Set-Cookie': "account="+account});
        response.end();
      });
      break;
    default:
      error404(response);
      break;
      */
  }
}

