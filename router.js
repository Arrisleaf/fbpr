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
       else if(pathname.substr(1)=='keyword.html'){
        console.log("Request for " + pathname + " received.");

    //request.setEncoding('utf-8');
    var postData = ""; //POST & GET ： name=zzl&email=zzl@sina.com
    // 数据块接收中
    request.addListener("data", function (postDataChunk) {
      postData += postDataChunk;
    });

    request.addListener("end", function () {
      var two=JSON.parse(postData);
      client.search({
        index: _index,
        type: two.pageid,
        q: "message:"+two.keyword,
        range : {
            "created_time" : {
                "gte" : "now-3M/d",
                "lt" :  "now/d"
               }
           }
      }, function (error, res) {
  // ...
       if(error){
           response.writeHead(500, {
           "Content-Type": "text/plain;charset=utf-8"});
//  response.end("fail.");
       }
       else{
       console.log("res:"+res);
       console.log("string res"+JSON.stringify(res));
       var p=JSON.stringify(res);
  /*
  response.writeHead(200, {
    "Content-Type": "text/plain;charset=utf-8"
  });
*/
       response.write(p);
       response.end();
       }  
       });

  });
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
     var p=JSON.parse(postData);
     console.log("postData:" + postData);
     console.log("P: "+p);
     console.log("P.data: "+p.data);

     var length=p.data.length;
     if(length>0)
     {
      var i=0;
      for (i=0;i<length;i++)
      {
        if(p.data[i].message===undefined)continue;
        /*
        console.log("ID: "+p.data[i].id);
        console.log("message: "+p.data[i].message);
        console.log("created_time: "+p.data[i].created_time);
        console.log("type: "+p.data[i].id.substring(0,p.data[i].id.indexOf("_")));
        */  
        client.index({
         index: _index,
         type: p.data[i].id.substring(0,p.data[i].id.indexOf("_")),
         id: p.data[i].id,
         body: {
          message: p.data[i].message,
          created_time: p.data[i].created_time,
          id: p.data[i].id
        }
      }, function (error, response) {
      });

      }
    }

    response.writeHead(200, {
      "Content-Type": "text/plain;charset=utf-8"
    });
    response.end("数据提交完毕");

  });
}
   else if (pathname.substr(1)=="css/bootstrap.min.css"){
 response.writeHead(200, {"Content-Type": "text/css"});
         // Write the content of the file to response body
         response.write(data.toString());
         response.end(); 
       }
  else{	
         //Page found	  
         // HTTP Status: 200 : OK
         // Content Type: text/plain
         response.writeHead(200, {'Content-Type': 'text/html'});	
         
         // Write the content of the file to response body
         response.write(data.toString());	
         response.end();	
       }
      // Send the response body 
    });   
}).listen(9836);

// Console will print the message
console.log('Server running at http://127.0.0.1:9836/');



