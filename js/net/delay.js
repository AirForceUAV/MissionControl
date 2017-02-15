var redis = require("redis");
var receive = redis.createClient();

receive.on("message", function (channel, message) {
	console.log(message);
    parse_type(message);
});

receive.subscribe("Network");

function parse_type(data){
    var type_arr = data.split(":");
    if(type_arr[0] == "Local"){
        $("#connect_to_cloud")[0].innerText = "本地";
        if(type_arr[1] == "true"){
            console.log("Local true");
            $("#delay_value")[0].innerText = type_arr[2].toString() + "ms";
            $(".cloud_status").css("color","red");
        }else{
            $(".cloud_status").css("color","#4A4A4A");
            console.log("Local false");
        }
    }else{
        $("#connect_to_cloud")[0].innerText = "远程";
        if(type_arr[1] == "false"){
        	$(".cloud_status").css("color","#4A4A4A");
            console.log("Remote:false");
        }else if(type_arr[2] == "Direct"){
            $(".cloud_status").css("color","red");
            $("#delay_value")[0].innerText = type_arr[3].toString() + "ms";
            console.log("Remote:Direct" + type_arr[3]);
        }else if(type_arr[2] == "Transit"){
            $(".cloud_status").css("color","red");
            $("#delay_value")[0].innerText = type_arr[3].toString() + "ms";
            console.log("Remote:Transit" + type_arr[3]);
        }
    }
}