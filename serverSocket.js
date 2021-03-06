const http = require("http");
const ex = require("express");
const socketio = require("socket.io");
const path = require("path");
const bodyParser = require("body-parser");
var request = require("request");
const pubPath = path.join(__dirname, "./src/");
var app = ex();
var server = http.createServer(app);

var io = socketio(server);
app.use(ex.static(pubPath));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
var matching = [];
var rooms = [];
/////////////////////////////////////////////////////////////////////////////////////////////////
var grantAccessCode;
var accessToken;
var refreshToken;
var activated;
var started;

app.get("/getOAuthToken", (req, res) => {
  //console.log("Grant Access Code", req.param("code"));
  grantAccessCode = req.param("code");
  getOAuthToken(r => {
    if (r) {
      res.send(
        `<script>const fs = require('fs');const remote = require('electron').remote;let w = remote.getCurrentWindow();w.close();</script>`
      );
    }
  });
});

app.get("/fetchAccessToken", (req, res) => {
  res.send({ a: accessToken, b: refreshToken });
  accessToken = null;
  started = null;
});
function getOAuthToken(callback) {
  //used to get the authentication token

  if (!started) {
    var jsonDataObj = {
      grant_type: "authorization_code",
      code: grantAccessCode,
      client_id: "de158fa6b9535c57960cbe0de83a15fa",
      client_secret: "9b64d81f37c674e74918afd7d4ade114",
      redirect_uri: "http://149.129.145.219:3000/getOAuthToken"
    };
    request.post(
      {
        url: "https://api.codechef.com/oauth/token",
        body: jsonDataObj,
        json: true
      },
      function(error, response, body) {
        //console.log(body.result.data.access_token);
        accessToken = body.result.data.access_token;
        refreshToken = body.result.data.refresh_token;
        //console.log("Access Token: ", accessToken);
        //console.log("Refresh Token: ", refreshToken);
        activated = true;
        started = true;
        //doSomething();
      }
    );
  }
  callback({ a: accessToken, b: refreshToken });
}

var refreshTokenInterval = setInterval(refreshTokenIntervalFunc, 3600000);
function refreshTokenIntervalFunc() {
  if (activated) {
    var jsonObj = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: "de158fa6b9535c57960cbe0de83a15fa",
      client_secret: "9b64d81f37c674e74918afd7d4ade114"
    };
    request.post(
      {
        url: "https://api.codechef.com/oauth/token",
        body: jsonObj,
        json: true
      },
      function(error, response, body) {
        //console.log(body.result.data.access_token);
        accessToken = body.result.data.access_token;
        refreshToken = body.result.data.refresh_token;
        //console.log("Access Token: ", accessToken);
        //console.log("Refresh Token: ", refreshToken);
      }
    );
  }
}
app.get("/getUserName", (req, res) => {
  //used to fetch the username of the user from codechef
  request.get(
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${req.param("accessToken")}`,
        Accept: "application/json"
      },
      url: "https://api.codechef.com/users/me"
    },
    function(error, response, body) {
      res.send(body);
    }
  );
});
app.get("/isSet", (req, res) => {
  if (accessToken == null) {
    res.send("ns");
  } else {
    res.send("set");
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////
function fetchProblem(token) {
  //This function is used to fetch problem

  var request = require("request");

  var options = {
    method: "GET",
    url: "https://api.codechef.com/contests/OCT17/problems/PERFCONT",
    headers: {
      "Postman-Token": "84fb112b-8c06-4e86-adab-35bf98a287d4",
      "Cache-Control": "no-cache",
      Authorization: `Bearer ${token}`
    }
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);

    //console.log(body);
  });
}

function check(link, token, socketwa) {
  //This function is used to check the result of a compiled code
  //We use the link given by the compile api request to check whether the code compiled
  //successfully and the output is correct and if correct we declare the winner

  var options3 = {
    method: "GET",
    url: "https://api.codechef.com/ide/status",
    qs: { link: `${link}` },
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  request(options3, function(error, response, result) {
    if (error) throw new Error(error);
    //console.log(result);
    result = JSON.parse(result);
    if (result.result.data.memory == 0) {
      socketwa.emit("compiling");
      //if the code is not compiled we send the request again after a inteterval of 2 seconds
      setTimeout(check, 2000, link, token, socketwa);
    } else {
      if (result.result.data.output === "2 4 6\n") {
        socketwa.emit("won", socketwa.id);
        socketwa.broadcast.emit("endedd");
      } else {
        socketwa.emit("errorer", {
          output: result.result.data.output,
          error: result.result.data.stderr
        });
      }
    }
  });
}

function IDE(code, token, socketwa) {
  //this function is called once the user request the code to compile
  //we send the code to codechef with a api request
  //and the link in the response is send checkc function

  //request is setup
  var options2 = {
    method: "POST",
    url: "https://api.codechef.com/ide/run",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },

    formData: { sourceCode: `${code}`, language: "PYPY", input: "" }
  };

  request(options2, function(error, response, body) {
    if (error) throw new Error(error);
    //console.log(body);
    body = JSON.parse(body);
    //console.log(body.result.data.link);
    //the link is passed to the check function after 2 seconds
    setTimeout(check, 2000, body.result.data.link, token, socketwa);
  });
}

io.on("connection", socket => {
  //console.log("Connected Client", socket.id);
  if (matching.length < 1) {
    matching.push(socket.id);
  } else {
    var roomName = parseInt(Math.random() * 10000);
    rooms.push(roomName);
    var c1 = matching[matching.length - 1];
    matching.pop(c1);
    var c2 = socket.id;
    io.emit(c1, roomName);
    io.emit(c2, roomName);
    var nsp = io.of(`/${roomName}`);
    var myvar = parseInt(Math.random() * 10000);
    nsp.on("connection", socketwa => {
      socketwa.emit(
        "problem",
        `${myvar}: Print series of even number till 7 with spaces in between.`
      );
      socketwa.on("get", (oout, aT) => {
        //console.log(oout);
        IDE(oout, aT, socketwa);
      });
    });
  }
  socket.on("disconnect", () => {
    //console.log("Disconnected", socket.id);
  });
});

server.listen(3000);
