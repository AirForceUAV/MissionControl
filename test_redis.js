// cnpm install redis
// http://redis.js.org/
var redis = require("redis")
var client = redis.createClient()

client.on("error", function (err) {
  console.log("Error " + err);
});

client.on("ready", function () {
  console.log("ready");
});

var ClientSendChan = "";
var ClientRecvChan = "";

client.set("ClientSendChan","Command", redis.print);
client.set("ClientRecvChan","Command", redis.print);
client.lpush("Command", "hello 11");
client.lpush("Command", "hello 22");
client.lpush("Command", "hello 33");
client.lpush("Command", "hello 44");
client.lpush("Command", "hello 55");


function getClientSendChan() {
  client.get("ClientSendChan", function (err, reply) {
    // reply is null when the key is missing
    ClientSendChan = reply;
    console.log("ClientSendChan:", ClientSendChan);
    setInterval(sendCommand, 1000)
  });
}

function getClientRecvChan() {
  client.get("ClientRecvChan", function (err, reply) {
    // reply is null when the key is missing
    ClientRecvChan = reply
    console.log("ClientRecvChan:", ClientRecvChan);
    receiveFlightLog();
  });
}

function sendCommand() {
  // Using LPUSH to Send Command
  var cmd = "This is a Command~~"
  client.lpush(ClientSendChan, cmd)
  console.log("Pushed:", cmd)
}

function receiveFlightLog() {
  //Using BRPOP to Receive FlightLog
  client.brpop(ClientRecvChan, 0, function (err, value) {
    console.log("Received:", value[1]);
    receiveFlightLog();
  })
}

var sub = redis.createClient(), pub = redis.createClient();
var msg_count = 0;

sub.on("subscribe", function (channel, count) {
    setInterval(function(){
      pub.publish("a nice channel", "I am sending a message.");
    }, 1000)
});

sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message);
});

sub.subscribe("a nice channel");

// getClientSendChan()
// getClientRecvChan();