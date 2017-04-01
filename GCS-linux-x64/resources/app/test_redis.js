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
sub.on("subscribe", function (channel, count) {
    setInterval(function(){
      pub.publish("Network", "Remote:Transit:true:1100");
    }, 1000)
});

sub.on("message", function (channel, message) {
  console.log("sub channel " + channel + ": " + message);
    var type_arr = message.split(":");
    if(type_arr[0] == "Local"){
        if(type_arr[1] == "true"){
            console.log("Local true");
        }else{
            console.log("Local false");
        }
    }else{
        if(type_arr[1] == "Direct"){
            console.log("Remote:Direct" + type_arr[3]);
        }else if(type_arr[1] == "Transit"){
            console.log("Remote:Transit" + type_arr[3]);
        }else{
            console.log("Remote:false");
        }
    }
});

sub.subscribe("Network");

// sub.on("subscribe", function (channel, count) {
//     setInterval(function(){
//       pub.publish("Network", "I am sending a message.");
//     }, 1000)
// });

// sub.on("message", function (channel, message) {
//     console.log("sub channel " + channel + ": " + message);
// });

// sub.subscribe("Network");

// getClientSendChan()
// getClientRecvChan();
