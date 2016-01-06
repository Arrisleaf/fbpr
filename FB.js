var clicks=0;
var lastpagename='';
var pages=[];	

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
		for (i=0;i<25;i++)
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
		for (i=0;i<25;i++)
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

		for (i=0;i<25;i++)
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



function getNextVerified(receive,count,callback){
	count++;
	var i=0;
	var path=receive.paging.next
	FB.api( path , { fields: 'is_verified'}, function(response) {
				//console.log(JSON.stringify(response));
				if (!response || response.error) {
					console.log('End of the search.');
					if (callback && typeof callback=='function')callback();
					return;
				} 
				else {
					for (i=0;i<25;i++){
						if(response.data[i]===undefined){
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
					if(i==25)
					{
						getNextVerified(response,count,callback);
					} 
					else if (callback && typeof callback=='function')callback();			
				}
				console.log("VR: "+count+" length: "+pages.length);
							document.getElementById("info").innerHTML=pages.length+' verified pages found...';
			});
};

function search()
{
	if(lastpagename==document.getElementById("pagename").value)return;
	
	lastpagename=document.getElementById("pagename").value;
	pages.length=0;
	document.getElementById("showlatest").innerHTML='';
	document.getElementById("showkeywords").innerHTML='';
	var path='/search?q='+document.getElementById("pagename").value+'&type=page';
	var i=0;
	var count=1;
	FB.api( path , { fields: 'is_verified'}, function(response) {
		console.log(JSON.stringify(response));
		if (!response || response.error) {
			document.getElementById("showlatest").innerHTML='Search failed.';
			return;
		} 
		else {
			for (i=0;i<25;i++){
				if(response.data[i]===undefined){
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
			if(i==25)
			{
				getNextVerified(response,count,show);
			}
			else show(); 
		}
		console.log("VR: "+count+" length: "+pages.length);

	});
}

function FBsearch(callback)
{
	FB.api( path , { fields: 'is_verified'}, function(response) {
		var i=0;
		//console.log(JSON.stringify(response));
		for (i=0;i<25;i++)
		{
			if(response.data[i]===undefined){
				document.getElementById("logs").innerHTML+='Round: '+round+' Verified Count:'+count+' ------------<br>';
				return;
			}
			if(response.data[i].is_verified==true)
			{
				pages.push(response.data[i].id);
				console.log(pages[i]);
				GetPost(response.data[i].id);
			}
		}
		document.getElementById("logs").innerHTML+='Round: '+round+' Verified Count:'+count+' ------------<br>';
		setTimeout(function(){GetNextVerified(response.paging.next,count,round)}, 1000);
	});
}

function show()
{
	var i=0
	if (pages.length==0){
		document.getElementById("info").innerHTML='No verified pages found.';
		return;
	}
	else
	{
		document.getElementById("info").innerHTML=pages.length+' verified pages found.';
	}
	for (i=0;i<pages.length;i++){


		console.log("page "+i+" : "+pages[i]);

		var count=0;
		var PC=0
		var PR=1;
		var path=pages[count]+'/posts';
		FB.api( path , function(response) {
				//console.log(JSON.stringify(response));
				if (!response || response.error) {
					document.getElementById("showlatest").innerHTML+=' End of the page';
					//if (callback && typeof callback=='function')callback();
					return;
				} 
				else {
					for (i=0;i<25;i++){
						if(response.data[i]===undefined){
							i=404;
							console.log('End of the page.');
							continue;
						}
						if(response.data[i].message===undefined)continue;
						PC++;
						if(response.data[i].story===undefined){	
							document.getElementById("showlatest").innerHTML+="<p><a href='http://www.facebook.com/"+response.data[i].id+"'>www.facebook.com/"+response.data[i].id+"</a><br>";
						}
						else{		
							document.getElementById("showlatest").innerHTML+="<p><a href='http://www.facebook.com/"+response.data[i].id+"'>"+response.data[i].story+"</a><br>";
						}
						document.getElementById("showlatest").innerHTML+='<span class="text-success" >'+response.data[i].created_time+"</span><br>";
						document.getElementById("showlatest").innerHTML+=response.data[i].message+"<br></p>";
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
        }
        console.log("PR: "+PR+" PC: "+PC);
    });
}

}

function getPost(pageid){

	var postcount=0
	var postround=1;
	var path=pageid+'/posts';
	FB.api( path , function(response) {
		var i=0;
		//console.log(JSON.stringify(response));
		for (i=0;i<25;i++)
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


