const request = require("request");
var accessToken;
var refreshToken;
var points = 0;
window.addEventListener("load", () => {
  request.get(
    {
      url: "http://149.129.145.219:3000/fetchAccessToken"
    },
    function(error, response, body) {
      console.log(body);
      accessToken = JSON.parse(body).a;
      refreshToken = JSON.parse(body).b;
      console.log(accessToken);
      getUserName();
    }
  );
});

function getUserName() {
  request.get(
    {
      url: `http://149.129.145.219:3000/getUserName?accessToken=${accessToken}`
    },
    function(error, response, body) {
      var userName = JSON.parse(body).result.data.content.fullname;
      document.getElementById("loading").style.display = "none";
      document.getElementById(
        "welcome-message"
      ).innerHTML = `<h3>Welcome, ${userName}</h3>`;
      console.log(userName);
      document.getElementById("matchButton").style.display = "";
      document.getElementById("points").style.display = "";
    }
  );
}

var output;
var sr;
function match() {
  document.getElementById("matchButton").style.display = "none";
  document.getElementById(
    "problem"
  ).innerHTML = `<img src="./assets/img/loader.gif" height="20%" width="20%">`;
  let socket = io();
  let socID;
  socket.on("connect", test => {
    console.log("Received Some Shit");
    console.log(socket.id);
    socket.on(socket.id, room => {
      console.log(room);
      sr = io(`/${room}`);
      sr.on("connect", res => {
        sr.on("problem", r => {
          console.log(r);
          document.getElementById("problem").innerHTML = `My Problem: ${r}`;
          document.getElementById("ansText").style.display = "";
          document.getElementById("cS").style.display = "";
        });
        sr.on("endedd", () => {
          console.log("Endeddddd");
          document.getElementById("cS").value = "Compile and Send";
          document.getElementById("cS").disabled = false;
          loser();
          sr.disconnect();
        });
        sr.on("won", res => {
          console.log(res);
          if ((sr.id = res)) {
            console.log("i win");
            document.getElementById("cS").value = "Compile and Send";
            document.getElementById("cS").disabled = false;
            winnerWinnerChickenDinner();
            sr.disconnect();
          }
        });
        sr.on("compiling", () => {
          console.log("compiling");
        });
        sr.on("errorer", err => {
          console.log(err);
          document.getElementById("cS").value = "Compile and Send";
          document.getElementById("cS").disabled = false;
        });
      });
    });
  });
}
function compileAndSend() {
  console.log(document.getElementById("ansText").value);
  document.getElementById("cS").value = "Compiling...";
  document.getElementById("cS").disabled = true;
  sr.emit("get", document.getElementById("ansText").value, accessToken);
}
function winnerWinnerChickenDinner() {
  alert("You Won");
  document.getElementById("matchButton").style.display = "";
  document.getElementById("problem").innerHTML = "";
  document.getElementById("ansText").style.display = "none";
  document.getElementById("cS").style.display = "none";
  points += 10;
  document.getElementById("points").innerHTML = `Points ${points}`;
}
function loser() {
  alert("You Lost");
  document.getElementById("matchButton").style.display = "";
  document.getElementById("problem").innerHTML = "";
  document.getElementById("ansText").style.display = "none";
  document.getElementById("cS").style.display = "none";
}
