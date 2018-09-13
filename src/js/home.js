const request = require('request');
let accessToken;
let refreshToken;
window.addEventListener('load',()=>{
   
    request.get({
        url: 'http://localhost:3000/fetchAccessToken'
    }, function(error, response, body){
        console.log(body);
        accessToken = JSON.parse(body).a;
        refreshToken = JSON.parse(body).b;
        console.log(accessToken);
        getUserName();
    })

});

function getUserName(){
    request.get({
        url: `http://localhost:3000/getUserName?accessToken=${accessToken}`
    }, function(error, response, body){
        let userName = JSON.parse(body).result.data.content.fullname;
        document.getElementById('loading').style.display = "none";
        document.getElementById('welcome-message').innerHTML = `Welcome ${userName}`;
        console.log(userName);
    }) 
}

let output;
    let sr;
    function match(){
    document.getElementById('matchButton').style.display = "none";
    document.getElementById('problem').innerHTML = `Matching...`;
    let socket = io();
    let socID;
    socket.on('connect',(test)=>{
        console.log('Received Some Shit');
        console.log(socket.id);
        socket.on(socket.id,(room)=>{
            console.log(room);
            sr = io(`/${room}`);
            sr.on('connect',(res)=>{
                sr.on("problem",(r)=>{
                    console.log(r);
                    document.getElementById('problem').innerHTML = `My Problem: ${r}`;
                    document.getElementById('ansText').style.display = "";
                    document.getElementById('cS').style.display = "";
                })
                sr.on("endedd",()=>{
                    console.log('Endeddddd');
                    loser();
                    sr.disconnect();
                });
                sr.on('won',(res)=>{
                    console.log(res);
                    if(sr.id = res){
                        console.log('i win');
                        winnerWinnerChickenDinner();
                        sr.disconnect();
                    }
                });
                sr.on('compiling',()=>{
                    console.log('compiling');
                });
                sr.on('errorer',(err)=>{
                    console.log(err);
                });
            })
            
        })
    });
}
function compileAndSend() {
    console.log(document.getElementById('ansText').value);
    sr.emit('get',document.getElementById('ansText').value,accessToken);
}
function winnerWinnerChickenDinner(){
    alert('You Won');
    document.getElementById('matchButton').style.display = "";
    document.getElementById('problem').innerHTML = "";
    document.getElementById('ansText').style.display = "none";   
    document.getElementById('cS').style.display = "none"; 
}
function loser(){
    alert('You Lost');
    document.getElementById('matchButton').style.display = "";
    document.getElementById('problem').innerHTML = "";
    document.getElementById('ansText').style.display = "none";  
    document.getElementById('cS').style.display = "none"; 
  
}