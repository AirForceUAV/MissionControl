const net = require('net');
const path = process.env.HOME + "/.UDS"+"_mc";

var client = net.connect({ path: path});
// delete for rtmp
require("../tools/echarts_tool.js");
require("./delay.js");

// listener
client.on('end', () => {
    console.log('disconnected from server');
});
client.on('connect', () => {
  $(".cloud_status").css("color","red");
  console.log('connect');
});
client.on('drain', () => {
  console.log('drain');
});
client.on('close', () => {
    $(".cloud_status").css("color","#4A4A4A");
    $(".f_status").css("color","#4A4A4A");
  console.log('close');
});
client.on('timeout', () => { 
    $(".cloud_status").css("color","#4A4A4A");
    $(".f_status").css("color","#4A4A4A");
  console.log('timeout');
});
client.on('error', (error) => {
    console.log(error.toString());
});

// test protobuf senors必须完整  只能用get 方法 构造方法不能写在括号里  只能set
var messages = require('./FlightLog_pb');

// var loc = new messages.Location();
// var att = new messages.Attitude();
// var poi = new messages.Point();
// var coo = new messages.Coordinate();
// var gps = new messages.GPS();
// var com = new messages.Compass();
// var bar = new messages.Barometre();
// var way = new messages.Waypoint();
// var cha = new messages.Channels();
// var sen = new messages.sensors(1);
// console.log(sen);

// loc.setAltitude(3);
// loc.setLatitude(1);
// loc.setLongitude(2);
// poi.setId(1);
// poi.setLocation(loc);
// way.addPoint(poi);
// way.addPoint(poi);

// way.addPoint(poi);

// att.setPitch(4);
// att.setRoll(5);
// att.setYaw(6);
// sen.setTarget(loc);
// sen.setHome(loc);
// sen.setAltitude(att)
// sen.setWaypoint(way);
// bytes = sen.serializeBinary();
// console.log(bytes);

// var message = messages.sensors.deserializeBinary(bytes);
// console.log(message);
// console.log(message.getWaypoint().getPointList()[0]);
// console.log(message.getTarget().getLatitude());
// console.log(message.getTarget().getLongitude());
// console.log(message.getTarget().getAltitude());
function handle_data_protobuf(data){
    console.log("!!!!");
    console.log(data);
    console.log(typeof data);
    console.log(new Uint8Array(data));
    // for protobuf
    var message = messages.sensors.deserializeBinary(new Uint8Array(data));
    // var message = data;
    console.log(message);

    // GPS 信息
    var gps = message.getGps();
    var gps_state = gps.getState();

    // 罗盘信息
    var compass = message.getCompass();
    // 罗盘健康信息 false不健康 true健康
    var compass_state = compass.getState();   

    // 气压计
    var barometre = message.getBaro();
    var barometre_state = barometre.getState();

    // 巡航线路
    var waypoint = message.getWaypoint();
    // var waypoint_index = waypoint.getIndex();
    // var waypoint_points = waypoint.getPointList(); 
    // var waypoint_type = waypoint.getType();

    // 目标点
    var target = message.getTarget();

    var distanceToTarget = message.getDistancetotarget();
    var distanceFromHome = message.getDistancefromhome();

    //  相对高度
    var altitude = message.getAltitude();

    // 模式
    var mode = message.getMode();

    // gear
    var gear = message.getGear();

    // var rpm = (Number(data.RPM)/100).toFixed(1);

    // data set
    $("#dis-target-value")[0].innerText = Number(distanceToTarget).toFixed(0);
    $("#dis-home-value")[0].innerText = Number(distanceFromHome).toFixed(0);
    $("#height-value")[0].innerText = Number(altitude).toFixed(0);
    
    $("#mode_value")[0].innerText = mode;
    if(gear == 1){
        $("#gear_level")[0].innerText = "低";
    }else if(gear == 2){
        $("#gear_level")[0].innerText = "中";
    }else if(gear == 3){
        $("#gear_level")[0].innerText = "高";
    }

    if(compass_state == false || gps_state == false || barometre_state == false){
        $("#sensors_warning").show();
    }else{
        $("#sensors_warning").hide(); 
    }
    if(gps_state == false){
        $("#gps_state")[0].innerText = "不健康";
    }else{
        $("#gps_state")[0].innerText = "健康";
        var gps_stars = gps.getNumStars();
        var location = gps.getLocation();

        var latitude = location.getLatitude();
        var longitude = location.getLongitude();
        // 高度
        var altitude = location.getAltitude();

        $("#gps_level")[0].innerText = gps_stars;
        locationCurrent = [latitude, longitude, altitude];

        // mark当前位置
        markPlane(longitude, latitude, yaw);
        // 飞行路线
        dynamicLine(longitude, latitude, 2);
        bPoints.push(new BMap.Point(longitude,latitude)); 

        // home
        var home = message.getHome();
        var home_latitude = home.getLatitude();
        var home_longitude = home.getLongitude();

        // home
        markHome(home_longitude,home_latitude);
    }
    if(compass_state == false){
        $("#compass_state")[0].innerText = "不健康";
    }else{
        $("#compass_state")[0].innerText = "健康";
        var compass_attitude = compass.getAttitude();
        // 升降
        var pitch = compass_attitude.getPitch();
        // 横滚
        var roll = compass_attitude.getRoll();
        // 偏航
        var yaw = compass_attitude.getYaw();
    }
    if(barometre_state == false){
        $("#baro_state")[0].innerText = "不健康";
    }else{
        $("#baro_state")[0].innerText = "健康";
        // 气压
        var pressure = barometre.getPressure();
        // 气温
        var temperature = barometre.getTemperature();
        // 海拔高度（绝对高度）
        var barometre_altitude = barometre.getAltitude();
        $("#baro_pressure")[0].innerText = pressure;
        $("#baro_temper")[0].innerText = temperature;
    }

    // download the path 
    if (openDowload && waypoint_type == "buyongle"){
        try{ 
            clearPath();
            var len = waypoint_points.length;
            dynamicLine(longitude, latitude, 3);
            for (var i =0 ; i<len; i++){
                var lng = waypoint_points[i].getLocation().getLongitude();
                var lat = waypoint_points[i].getLocation().getLatitude();
                // 3 for path
                dynamicLine(lng, lat, 3);
            }
            openDowload = false;
        }catch(err){
            console.log("error");
        }
    }
}

// 监听数据
client.on('data', (data) => {
    //  connect to plane
    $(".f_status").css("color","red");

    handle_data_protobuf(data);


    // //use this data to show for json
    // console.log("Mission Control got: " + data.toString());
    // var data = eval('(' + data.toString() + ')');

 
    // // battery
    // var battery = data.Battery.split(",")
    // var voltage = battery[0];
    // var level = battery[1];
    // var current = battery[2];

    // // velocity
    // var velocity = data.Velocity.split(",");
    // var xv = velocity[0];
    // var yv = velocity[1];
    // var zv = velocity[2];

    // // attitude
    // var attitude = data.Gimbal.split(",");

    // // locationCurrent = data.LocationGlobal.split(",");
    // locationCurrent = data.LocationGlobal;

    // // 纬度
    // var latitude = locationCurrent[0];
    // // 经度
    // var longtitude = locationCurrent[1];
    // // 高度
    // var height = Number(locationCurrent[2]).gied(2);
    // // distance
    // var distance = Number(data.DistanceFromHome).toFixed(0);
    // // GPS
    // var GPS = data.GPS;

    // var mode = data.Mode;

    // var gear = data.Gear;

    // var rpm = (Number(data.RPM)/100).toFixed(1);

    // var heading = data.Heading;

    // // data set
    // $("#battery-number")[0].innerText = current + "%";
    // $("#battery-level")[0].innerText = level + "V";
    // $("#dis-value")[0].innerText = distance;
    // $("#height-value")[0].innerText = height;
    // $("#x-value")[0].innerText = xv;
    // $("#y-value")[0].innerText = yv;
    // $("#z-value")[0].innerText = zv;
    // $("#gps_level")[0].innerText = GPS;
    // $("#mode_value")[0].innerText = mode;
    // if(gear == 1){
    //     $("#gear_level")[0].innerText = "L";
    // }else if(gear == 2){
    //     $("#gear_level")[0].innerText = "M";
    // }else if(gear == 3){
    //     $("#gear_level")[0].innerText = "H";
    // }

    // // ecahrts set
    // option.series[0].data[0].value = rpm;
    // eChart.setOption(option,true);

    // // mark当前位置
    // markPlane(longtitude, latitude, attitude[1]);
    // // 飞行路线
    // dynamicLine(longtitude, latitude, 2);
    // bPoints.push(new BMap.Point(longtitude,latitude)); 

    // // download the path 
    // if (data.AllWp != null) {
    //     console.log(data.AllWp);
    //     var path_locations = data.AllWp.split(",");
    //     var len = data.length;
    //     dynamicLine(longtitude, latitude, 3);
    //     for (var i =0 ; i<len; i++){
    //         var path_location = path_locations.split("+");
    //         var lng = path_location[1];
    //         var lat = path_location[0];
    //         // 3 for path
    //         dynamicLine(lng, lat, 3);
    //     } 
    // }

    // // battery progress
    // if (current > 30) {
    //     var tmp = current - 30;
    //     var width = tmp.toString() + '%';
    //     $(".progress-bar-info").css("width", width);
    // }
    // else if(current > 10){
    //     var tmp = current - 10;
    //     var width = tmp.toString() + '%';
    //     $(".progress-bar-info").css("width", 0);
    //     $(".progress-bar-warning").css("width", width);
    // }else{
    //     var tmp = current;
    //     var width = tmp.toString() + '%';
    //     $(".progress-bar-info").css("width", 0);
    //     $(".progress-bar-warning").css("width", 0);
    //     $(".progress-bar-danger").css("width", width);
    // }

});

module.exports = client;