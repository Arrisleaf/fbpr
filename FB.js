	

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


function GetVerified(){
	document.getElementById("logs").innerHTML=''
	var count=0;
	var round=1;
	var path='/search?q='+document.getElementById("keyword").value+'&type=page';
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
				document.getElementById("logs").innerHTML+=(response.data[i].id+'<br>');
				count++;
				GetPost(response.data[i].id);
			}
		}
		document.getElementById("logs").innerHTML+='Round: '+round+' Verified Count:'+count+' ------------<br>';
		setTimeout(function(){GetNextVerified(response.paging.next,count,round)}, 1000);
	});
};

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

function search()
{
	
     show();


}

function show()
{


}
