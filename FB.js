var clicks=0;
var lastpagename='';
var pages=[];
var pagenum=0;
var pagenames=[];
var lastresponse={};
var limit=100;
var t1 = new Date();
var t2 = new Date();
var ct1 = new Date();
var ct2 = new Date();

function clearPageName(){
	document.getElementById("pagename").value="";
}
function clearKeyword(){
	document.getElementById("keyword").value="";
}

window.fbAsyncInit = function() {
	FB.init({
		appId      : '1536570046666489',
		xfbml      : true,
		version    : 'v2.5'
	});

};
function Login()
{
	FB.login(function(response) {
		if (response.authResponse) 
		{
			//getUserInfo();
		} else 
		{
			console.log('User cancelled login or did not fully authorize.');
		}
	},{scope: 'email,user_photos,user_videos'});

}

function getUserInfo() {
	FB.api('/me', function(response) {
		console.log(JSON.stringify(response));

		var str="<b>Name</b> : "+response.name+"<br>";
		str +="<b>id: </b>"+response.id+"<br>";
		str +="<input type='button' value='Get Photo' onclick='getPhoto();'/>";
		str +="<input type='button' value='Logout' onclick='Logout();'/>";
		document.getElementById("status").innerHTML=str;

	});
}
function getPhoto()
{
	FB.api('/me/picture?type=normal', function(response) {

		var str="<br/><b>Pic</b> : <img src='"+response.data.url+"'/>";
		document.getElementById("status").innerHTML+=str;

	});

}

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));




/*
function GetNextVerified(path,count,round){
	round++;
	FB.api( path,  function(response) {
		var i=0;
		//console.log("content:"+JSON.stringify(response));
		for (i=0;i<limit;i++)
		{
			if(response.data[i]===undefined){
				document.getElementById("logs").innerHTML+='Round: '+round+' Verified Count:'+count+' ------------<br>';
				return;
			}
			if(response.data[i].is_verified==true)
			{
				document.getElementById("logs").innerHTML+=(response.data[i].id+'<br>');
				count++;
				GetPost(response.data[i].id);
			}
		}
		document.getElementById("logs").innerHTML+='Round: '+round+' Verified Count:'+count+' ------------<br>';
		setTimeout(function(){GetNextVerified(response.paging.next,count,round)}, 1000);
	});
};
*/


function GetPost(pageid){

	var postcount=0
	var postround=1;
	var path=pageid+'/posts';
	FB.api( path , function(response) {
		var i=0;
		//console.log(JSON.stringify(response));
		for (i=0;i<limit;i++)
		{
			if(response.data[i]===undefined){
				document.getElementById("logs").innerHTML+='Posts Round: '+postround+' Posts Count:'+postcount+' ------------<br>';
				return ;
			}
			if(response.data[i].message===undefined)continue;
			
				//document.getElementById("logs").innerHTML+=(response.data[i].id+'<br>');
				postcount++;
				var xhr = new XMLHttpRequest();   // new HttpRequest instance 
				xhr.onreadystatechange = function() {
					if (xhr.readyState == XMLHttpRequest.DONE) {
						console.log(xhr.responseText);
					}
				}
				xhr.open("POST", "/elastic.html");
                //xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.send(JSON.stringify(response.data[i]));

            }
            document.getElementById("logs").innerHTML+='Posts Round: '+postround+' Posts Count:'+postcount+' ------------<br>';
            setTimeout(function(){GetNextPost(response.paging.next,postcount,postround)}, 1000);
        });

}

function GetNextPost(path,postcount,postround){

	postround++;
	FB.api( path , function(response) {
		var i=0;
		//console.log(JSON.stringify(response));

		for (i=0;i<limit;i++)
		{
			if(response.data[i]===undefined){
				document.getElementById("logs").innerHTML+='Posts Round: '+postround+' Posts Count:'+postcount+' ------------<br>';
				return;
			}
			if(response.data[i].message===undefined)continue;
			
				//document.getElementById("logs").innerHTML+=(response.data[i].id+'<br>');
				postcount++;
				var xhr = new XMLHttpRequest();   // new HttpRequest instance 
				xhr.onreadystatechange = function() {
					if (xhr.readyState == XMLHttpRequest.DONE) {
						console.log(xhr.responseText);
					}
				}
				xhr.open("POST", "/elastic.html");
                //xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.send(JSON.stringify(response.data[i]));

            }
            document.getElementById("logs").innerHTML+='Posts Round: '+postround+' Posts Count:'+postcount+' ------------<br>';
            setTimeout(function(){GetNextPost(response.paging.next,postcount,postround)}, 1000);
        });

}

function Logout()
{
	FB.logout(function(){document.location.reload();});
}

function crawlPage(CPS,CPI,LR,callback){
	if(LR===undefined && CPI<CPS.length){
		var path=CPS[CPI]+'/posts?limit='+limit;
	}
	else if(LR.paging && LR.paging.next){
		var path=LR.paging.next;
	}
	else if(CPI+1<CPS.length){ 
		callback && callback(CPS,CPI+1,undefined,callback);
		return;
	}
	else {
		ct2 = new Date();
		console.log("Crawl ends!");
		console.log("Crawl elasped time:"+(ct2.getTime()-ct1.getTime())/1000+" s");
		return;
	}

	FB.api( path , function(response) {
		//console.log(JSON.stringify(response));
		if (!response || response.error || response==[]) {
			callback && callback(CPS,CPI+1,undefined,callback);
			console.log("crawl CPS[CPI]: "+CPS[CPI]+"CPI: "+CPI);
		} 
		else {
			var length=response.data.length;
			if(length>0){
				        var xhr = new XMLHttpRequest();   // new HttpRequest instance 
				        xhr.onreadystatechange = function() {
				        	if (xhr.readyState == XMLHttpRequest.DONE) {
				        		console.log(xhr.responseText);
				        	}
				        }
				        xhr.open("POST", "/elastic.html");
                        //xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.send(JSON.stringify(response));
                    }
                }
                callback && callback(CPS,CPI,response,callback);
            });
}

function crawl()
{
	console.log("crawl begins!");
	ct1 = new Date();
	var crawlpages=pages;
	var i=0;
	var path=crawlpages[i]+'/posts?limit='+limit;
	if (crawlpages.length==0)return;
	crawlPage(crawlpages,i,undefined,crawlPage);
}

function getNextVerified(receive,count,callback){
	count++;
	var i=0;
	var path=receive.paging.next;
	FB.api( path , { fields: 'is_verified'}, function(response) {
				//console.log(JSON.stringify(response));
				if (!response || response.error) {
					console.log('End of the search.');
					show();
					callback && callback();
				} 
				else {
					for (i=0;i<limit;i++){
						if(response.data[i]===undefined){
							console.log("total: "+i);
							i=404;
							console.log('End of the search.');
							continue;
						}
						if(response.data[i].is_verified==true)
						{
							pages.push(response.data[i].id);
							console.log(pages[pages.length-1]);
						}
					}
					console.log("VR: "+count+" length: "+pages.length);
					document.getElementById("info").innerHTML=pages.length+' verified pages found...';
					if(i==limit)
					{
						getNextVerified(response,count,callback);
					} 
					else
					{
						show();
						callback && callback();
					}				
				}

			});
};

function search()
{
	if(lastpagename==document.getElementById("pagename").value)return;
	t1 = new Date();
	pagenum=0;
	lastpagename=document.getElementById("pagename").value;
	pages.length=0;
	pagenames.length=0;
	document.getElementById("currentpagename").innerHTML='';
	document.getElementById("showlatest").innerHTML='';
	document.getElementById("showkeywords").innerHTML='';
	var path='/search?q='+document.getElementById("pagename").value+'&type=page&limit='+limit;
	var i=0;
	var count=1;
	FB.api( path , { fields: 'name,is_verified'}, function(response) {
		console.log(JSON.stringify(response));
		if (!response || response.error) {
			document.getElementById("info").innerHTML='Search failed.';
			return;
		} 
		else {
			for (i=0;i<limit;i++){
				if(response.data[i]===undefined){
					console.log("total: "+i);
					i=404;
					console.log('End of the search.');
					continue;
				}
				if(response.data[i].is_verified==true)
				{
					pages.push(response.data[i].id);
					pagenames.push(response.data[i].name);
					console.log(pages[pages.length-1]);
					console.log(pagenames[pagenames.length-1]);
				}
			}
			if(i==limit)
			{
				getNextVerified(response,count,crawl);
			}
			else {
				show();
				crawl();
			}; 
		}
		console.log("VR: "+count+" length: "+pages.length);

	});
}

function show()
{

	if (pages.length==0){
		document.getElementById("info").innerHTML='No verified pages found.';
		return;
	}
	else
	{
		pagenum=0;
		console.log("PN: "+pagenames[pagenum]);
		document.getElementById("currentpagename").innerHTML=pagenames[pagenum];	
		document.getElementById("info").innerHTML='#'+(pagenum+1)+" of "+pages.length+' verified pages.';
	}

	console.log("page "+pagenum+" : "+pages[pagenum]);
	var i=0
	var PC=0
	var PR=1;
	var path=pages[pagenum]+'/posts?limit='+limit;
	FB.api( path , function(response) {
				//console.log(JSON.stringify(response));
				if (!response || response.error) {
					document.getElementById("showlatest").innerHTML+=' End of the page';
					//if (callback && typeof callback=='function')callback();
					return;
				} 
				else {
					lastresponse=response;
					for (i=0;i<limit;i++){
						if(response.data[i]===undefined){
							i=404;
							console.log('End of the page.');
							continue;
						}
						if(response.data[i].message===undefined)continue;
						PC++;
						if(response.data[i].story===undefined){	
							document.getElementById("showlatest").innerHTML+="<a href='https://www.facebook.com/"+response.data[i].id+"'>link</a><br>";
						}
						else{		
							document.getElementById("showlatest").innerHTML+="<a class='lead' href='https://www.facebook.com/"+response.data[i].id+"'>"+response.data[i].story+"</a><br>";
						}
						document.getElementById("showlatest").innerHTML+='<span class="text-success small" >'+response.data[i].created_time+"</span><br>";
						document.getElementById("showlatest").innerHTML+="<h4>"+response.data[i].message+"</h4><br>";
					}
					/*
				        var xhr = new XMLHttpRequest();   // new HttpRequest instance 
				        xhr.onreadystatechange = function() {
				        	if (xhr.readyState == XMLHttpRequest.DONE) {
				        		console.log(xhr.responseText);
				        	}
				        }
				        xhr.open("POST", "/elastic.html");
                        //xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.send(JSON.stringify(response));
                        */
                    }
                    t2 = new Date();
                    console.log("Crawl elasped time: "+(t2.getTime()-t1.getTime())/1000);
                    document.getElementById("elaspedtime").innerHTML="elasped time: "+(t2.getTime()-t1.getTime())/1000+"s";
                    console.log("PR: "+PR+" PC: "+PC);

                });
}

function getPreviousPage()
{

	if (pages.length==0 || pagenum-1<0){
		console.log("PN: "+pagenum+" PL: "+pages.length);
		document.getElementById("info").innerHTML='No previous verified page.';
		return;
	}
	else
	{
		pagenum--;
		console.log("PN: "+pagenames[pagenum]);
		document.getElementById("currentpagename").innerHTML=pagenames[pagenum];
		document.getElementById("showlatest").innerHTML='';
		document.getElementById("info").innerHTML='#'+(pagenum+1)+" of "+pages.length+' verified pages.';
	}

	console.log("page "+pagenum+" : "+pages[pagenum]);
	var i=0
	var path=pages[pagenum]+'/posts';
	FB.api( path , function(response) {
				//console.log(JSON.stringify(response));
				if (!response || response.error) {
					document.getElementById("showlatest").innerHTML+=' End of the page';
					//if (callback && typeof callback=='function')callback();
					return;
				} 
				else {
					lastresponse=response;
					for (i=0;i<limit;i++){
						if(response.data[i]===undefined){
							i=404;
							console.log('End of the page.');
							continue;
						}
						if(response.data[i].message===undefined)continue;
						if(response.data[i].story===undefined){	
							document.getElementById("showlatest").innerHTML+="<a href='https://www.facebook.com/"+response.data[i].id+"'>link</a><br>";
						}
						else{		
							document.getElementById("showlatest").innerHTML+="<a class='lead' href='https://www.facebook.com/"+response.data[i].id+"'>"+response.data[i].story+"</a><br>";
						}
						document.getElementById("showlatest").innerHTML+='<span class="text-success small" >'+response.data[i].created_time+"</span><br>";
						document.getElementById("showlatest").innerHTML+="<h4>"+response.data[i].message+"</h4><br>";
					}
					/*
				        var xhr = new XMLHttpRequest();   // new HttpRequest instance 
				        xhr.onreadystatechange = function() {
				        	if (xhr.readyState == XMLHttpRequest.DONE) {
				        		console.log(xhr.responseText);
				        	}
				        }
				        xhr.open("POST", "/elastic.html");
                        //xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.send(JSON.stringify(response));
                        */
                    }
                });
}


function getNextPage()
{

	if (pages.length==0 || pagenum+1>=pages.length){
		console.log("PN: "+pagenum+" PL: "+pages.length);
		document.getElementById("info").innerHTML='No next verified page.';
		return;
	}
	else
	{
		pagenum++;
		console.log("PN: "+pagenames[pagenum]);
		document.getElementById("currentpagename").innerHTML=pagenames[pagenum];
		document.getElementById("showlatest").innerHTML='';
		document.getElementById("info").innerHTML='#'+(pagenum+1)+" of "+pages.length+' verified pages.';
	}

	console.log("page "+pagenum+" : "+pages[pagenum]);
	var i=0
	var path=pages[pagenum]+'/posts';
	FB.api( path , function(response) {
				//console.log(JSON.stringify(response));
				if (!response || response.error) {
					document.getElementById("showlatest").innerHTML+=' End of the page';
					//if (callback && typeof callback=='function')callback();
					return;
				} 
				else {
					lastresponse=response;
					for (i=0;i<limit;i++){
						if(response.data[i]===undefined){
							i=404;
							console.log('End of the page.');
							continue;
						}
						if(response.data[i].message===undefined)continue;
						if(response.data[i].story===undefined){	
							document.getElementById("showlatest").innerHTML+="<a href='https://www.facebook.com/"+response.data[i].id+"'>link</a><br>";
						}
						else{		
							document.getElementById("showlatest").innerHTML+="<a class='lead' href='https://www.facebook.com/"+response.data[i].id+"'>"+response.data[i].story+"</a><br>";
						}
						document.getElementById("showlatest").innerHTML+='<span class="text-success small" >'+response.data[i].created_time+"</span><br>";
						document.getElementById("showlatest").innerHTML+="<h4>"+response.data[i].message+"</h4><br>";
					}
					/*
				        var xhr = new XMLHttpRequest();   // new HttpRequest instance 
				        xhr.onreadystatechange = function() {
				        	if (xhr.readyState == XMLHttpRequest.DONE) {
				        		console.log(xhr.responseText);
				        	}
				        }
				        xhr.open("POST", "/elastic.html");
                        //xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.send(JSON.stringify(response));	
                        */
                    }
                });
}

function showmore()
{
	if (pages.length==0){
		document.getElementById("info").innerHTML='No verified pages found.';
		return;
	}
	else
	{
		document.getElementById("info").innerHTML=pages.length+' verified pages found.';
	}
	var i=0;
	var path=lastresponse.paging.next;
	FB.api( path , function(response) {
				//console.log(JSON.stringify(response));
				if (!response || response.error) {
					document.getElementById("showlatest").innerHTML+=' End of the page';
					//if (callback && typeof callback=='function')callback();
					return;
				} 
				else {
					lastresponse=response;
					for (i=0;i<limit;i++){
						if(response.data[i]===undefined){
							i=404;
							console.log('End of the page.');
							continue;
						}
						if(response.data[i].message===undefined)continue;
						if(response.data[i].story===undefined){	
							document.getElementById("showlatest").innerHTML+="<a href='https://www.facebook.com/"+response.data[i].id+"'>link</a><br>";
						}
						else{		
							document.getElementById("showlatest").innerHTML+="<a class='lead' href='https://www.facebook.com/"+response.data[i].id+"'>"+response.data[i].story+"</a><br>";
						}
						document.getElementById("showlatest").innerHTML+='<span class="text-success small" >'+response.data[i].created_time+"</span><br>";
						document.getElementById("showlatest").innerHTML+="<h4>"+response.data[i].message+"</h4><br>";
					}
					/*
				        var xhr = new XMLHttpRequest();   // new HttpRequest instance 
				        xhr.onreadystatechange = function() {
				        	if (xhr.readyState == XMLHttpRequest.DONE) {
				        		console.log(xhr.responseText);
				        	}
				        }
				        xhr.open("POST", "/elastic.html");
                        //xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.send(JSON.stringify(response));	
                        */
                    }
                });
}

