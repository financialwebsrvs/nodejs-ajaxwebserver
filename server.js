/* 
    This program is a basic http server with ajax support.
    --------------------------------------------------------
    1) The server side is based on,-----> https://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server, 
          answer of "Jonathan Tran" (https://stackoverflow.com/users/12887/jonathan-tran)
          and edited by "Mike Laren" (https://stackoverflow.com/users/2580791/mike-laren).

    
    2) The ajax side is based on,-----> "https://code-maven.com/http-client-request-in-nodejs" 
        by "Gabor Szabo" (https://plus.google.com/102810219707784087582?rel=author, https://szabgab.com/contact.html)

    I would recoment to read both of above examples to understund the concept.
    Many thanks to above authors !!!
    --------------------------------------------------------
    
    Hope this help anyone who want to start with node.js and having http+ajax :)
  

    **  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.  **

*/

//  Define nodejs requirements
var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs");

//  Using port 8888 as default or supplied by command line argument....
port = process.argv[2] || 8888;


/*
    ===============================================================
    --  Initialize http server  --
    ===============================================================
*/
var mServer = http.createServer();

    /*
        Setting up request event
    */
    mServer.on("request", function (request, response) {
      /* 
          Server accepted a request and :
            1. collects data (if sended)  
            2. on request.end --> constructs a response
          
      */
      
     console.log("---------------------------------------------------");
      var data = "";
      // 1. accepting data ....
      request.on("data", function (chunk) {
        data += chunk;
        console.log("Event data: " + data);
      });
      
      // 2. accepting finilization signal ....
      request.on("end", function () {
        srvSupportResponseHandling(request, response, data);
        console.log("Request/Response completed.");
        console.log("---------------------------------------------------");
        
      });
    });



/*
    --  Activate http server and accept incoming request's  --
*/
mServer.listen(port);
console.log("Browse to http://localhost:" + port);




/*
    ===============================================================
    --  Support functions  --
    ===============================================================
*/

function srvSupportResponseHandling(request, response, ajaxservicedata) {


  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css': "text/css",
    '.js': "text/javascript"
  };


  if (uri != "/ajaxservice") {
    // Handling files over the server---------------------------------
        console.log("File handling from server");
        fs.exists(filename, function (exists) {
          if (!exists) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.write("404 Not Found\n");
            response.end();
            return;
          }

          if (fs.statSync(filename).isDirectory()) filename += '/index.html';

          fs.readFile(filename, "binary", function (err, file) {
            if (err) {
              response.writeHead(500, { "Content-Type": "text/plain" });
              response.write(err + "\n");
              response.end();
              return;
            }

            var headers = {};
            var contentType = contentTypesByExtension[path.extname(filename)];
            if (contentType) headers["Content-Type"] = contentType;
            response.writeHead(200, headers);
            response.write(file, "binary");
            response.end();
          });
        }

        );
  } else {
    // Handling AJAX service--------------------------------------------
        console.log("AJAX service requested with data: " + ajaxservicedata);
        response.writeHead(200, {"Content-Type": "text/xml"});
        response.end("Server received message: " + ajaxservicedata);
  }
}
