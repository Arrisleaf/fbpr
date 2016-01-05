var http=require("http");
var fs = require("fs");
var url = require('url');
var querystring = require("querystring");
var client = require('./elastic.js').client;
var _index = 'facebook';

// Create a server
http.createServer( function (request, response) {  
   // Parse the request containing file name
   var pathname = url.parse(request.url).pathname;
   
   // Print the name of the file for which request is made.
   // Read the requested file content from file system
   fs.readFile(pathname.substr(1), function (err, data) {
      if (err) {
         console.log(err);
         // HTTP Status: 404 : NOT FOUND
         // Content Type: text/plain
         response.writeHead(404, {'Content-Type': 'text/html'});
      }
      else if(pathname.substr(1)=='elastic.html')
      {
  
          console.log("Request for " + pathname + " received.");

    //request.setEncoding('utf-8');
    var postData = ""; //POST & GET ： name=zzl&email=zzl@sina.com
    // 数据块接收中
    request.addListener("data", function (postDataChunk) {
        postData += postDataChunk;
    });
    

 request.addListener("end", function () {
            var p=JSON.parse(postData)
//            console.log("POST: "+postData);
            console.log("ID: "+p.id);
            console.log("message: "+p.message);
            console.log("created_time: "+p.created_time);
            console.log("type: "+p.id.substring(0,p.id.indexOf("_")));
            
         client.index({
               index: _index,
               type: p.id.substring(0,p.id.indexOf("_")),
               id: p.id,
               body: {
                  message: p.message,
                  created_time: p.created_time,
                  id: p.id
               }
            }, function (error, response) {
            });

        response.writeHead(200, {
            "Content-Type": "text/plain;charset=utf-8"
        });
        response.end("数据提交完毕");

    });
      }
      else if (pathname.substr(1)=="css/bootstrap.min.css")
      {
         response.writeHead(200, {"Content-Type": "text/css"});
         // Write the content of the file to response body
         response.write(data.toString()); 
      }
      else{	
         //Page found	  
         // HTTP Status: 200 : OK
         // Content Type: text/plain
         response.writeHead(200, {'Content-Type': 'text/html'});	
         
         // Write the content of the file to response body
         response.write(data.toString());		
      }
      // Send the response body 
      response.end();
   });   
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');



