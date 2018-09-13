const remote = require('electron').remote
let w = remote.getCurrentWindow()

let url = 'http://149.129.136.231:3000/';
function makeCall(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function checkForIsSet(callback){
    makeCall(`${url}isSet`,(res)=>{
        if(res){
            //console.log(res);
            if(res == 'set'){
                window.location.replace("home.html");
            }
        }
    })
}
let checkLoginInterval = setInterval(checkForIsSet,400);
let codechefLogin = () => {
    window.open(`https://api.codechef.com/oauth/authorize?response_type=code&client_id=de158fa6b9535c57960cbe0de83a15fa&state=xyz&redirect_uri=http://149.129.136.231:3000/getOAuthToken`);
    //checkForIsSet();
}