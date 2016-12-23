const net = require('net');
const path = process.env.HOME + "/.UDS"+"_mc";
var client = net.connect({ path: path});
// init echarts
var eChart = echarts.init(document.getElementById('e-attr'));
// init baidu map
var map = new BMap.Map("allmap",{enableMapClick:false});
// 设置位置
var point = new BMap.Point(116.331398,39.897445);
map.centerAndZoom(point,17);

// 地图数据
// 原始点信息数组  
var points = [];
// 路径数据
var path_points = []; 
//百度化坐标数组。用于更新显示范围
var bPoints = [];  
// 当前位置在地图上的标注
var plane_marker;
// 路径标注
var path_marker;
// 路径num
var path_num = 1;
// 当前位置记录
var locationCurrent = [];
  
// echarts data
option = {
    backgroundColor: '#1b1b1b',
    tooltip : {
        formatter: "{a} <br/>{c} {b}"
    },
    toolbox: {
        show : false
    },
    series : [
        {
            name:'速度',
            type:'gauge',
            min:0,
            max:30,
            splitNumber:5,
            radius: '90%',
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: [[0.09, 'lime'],[0.82, '#1e90ff'],[1, '#ff4500']],
                    width: 1,
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            axisLabel: {            // 坐标轴小标记
                textStyle: {       // 属性lineStyle控制线条样式
                    fontWeight: 'bolder',
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            axisTick: {            // 坐标轴小标记
                length :5,        // 属性length控制线长
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: 'auto',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            splitLine: {           // 分隔线
                length :8,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    width:1,
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            pointer: {           // 分隔线
                shadowColor : '#fff', //默认透明
                shadowBlur: 5,
                width: 4,
            },
            title : {
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'bolder',
                    fontSize: 12,
                    fontStyle: 'italic',
                    color: '#fff',
                    shadowColor : '#fff', //默认透明
                    shadowBlur: 10
                }
            },
            detail : {
                offsetCenter: [0, '60%'],       // x, y，单位px
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'bolder',
                    color: 'rgba(30,144,255,0.8)',
                    fontSize: 25
                }
            },
            data:[{value: 40, name: 'x100'}]
        }
    ]
};
// set
eChart.setOption(option);

// 监听数据
client.on('data', (data) => {
    //  connect to plane
    $(".f_status").css("color","red");

    //use this data to show
    console.log("Mission Control got: " + data.toString());
    var data = eval('(' + data.toString() + ')');
 
    // battery
    var battery = data.Battery.split(",")
    var voltage = battery[0];
    var level = battery[1];
    var current = battery[2];

    // velocity
    var velocity = data.Velocity.split(",");
    var xv = velocity[0];
    var yv = velocity[1];
    var zv = velocity[2];

    // attitude
    var attitude = data.Gimbal.split(",");

    // locationCurrent = data.LocationGlobal.split(",");
    locationCurrent = data.LocationGlobal;

    // 纬度
    var latitude = locationCurrent[0];
    // 经度
    var longtitude = locationCurrent[1];
    // 高度
    var height = Number(locationCurrent[2]).gied(2);
    // distance
    var distance = Number(data.DistanceFromHome).toFixed(0);
    // GPS
    var GPS = data.GPS;

    var mode = data.Mode;

    var gear = data.Gear;

    var rpm = (Number(data.RPM)/100).toFixed(1);

    var heading = data.Heading;

    // data set
    $("#battery-number")[0].innerText = current + "%";
    $("#battery-level")[0].innerText = level + "V";
    $("#dis-value")[0].innerText = distance;
    $("#height-value")[0].innerText = height;
    $("#x-value")[0].innerText = xv;
    $("#y-value")[0].innerText = yv;
    $("#z-value")[0].innerText = zv;
    $("#gps_level")[0].innerText = GPS;
    $("#mode_value")[0].innerText = mode;
    if(gear == 1){
        $("#gear_level")[0].innerText = "L";
    }else if(gear == 2){
        $("#gear_level")[0].innerText = "M";
    }else if(gear == 3){
        $("#gear_level")[0].innerText = "H";
    }

    // ecahrts set
    option.series[0].data[0].value = rpm;
    eChart.setOption(option,true);

    // mark当前位置
    markPlane(longtitude, latitude, attitude[1]);
    // 飞行路线
    dynamicLine(longtitude, latitude, 2);
    bPoints.push(new BMap.Point(longtitude,latitude)); 

    // download the path 
    if (data.AllWp != null) {
        console.log(data.AllWp);
        var path_locations = data.AllWp.split(",");
        var len = data.length;
        dynamicLine(longtitude, latitude, 3);
        for (var i =0 ; i<len; i++){
            var path_location = path_locations.split("+");
            var lng = path_location[1];
            var lat = path_location[0];
            // 3 for path
            dynamicLine(lng, lat, 3);
        } 
    }

    // battery progress
    if (current > 30) {
        var tmp = current - 30;
        var width = tmp.toString() + '%';
        $(".progress-bar-info").css("width", width);
    }
    else if(current > 10){
        var tmp = current - 10;
        var width = tmp.toString() + '%';
        $(".progress-bar-info").css("width", 0);
        $(".progress-bar-warning").css("width", width);
    }else{
        var tmp = current;
        var width = tmp.toString() + '%';
        $(".progress-bar-info").css("width", 0);
        $(".progress-bar-warning").css("width", 0);
        $(".progress-bar-danger").css("width", width);
    }

});
if (option && typeof option === "object") {
eChart.setOption(option, true);
} 

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
         
// order
$(".location").on("click", function () {  
    setZoom(bPoints);
}); 
$(".guide_fly").on("click", function () {
    hideWin();
    client.write("vehicle.Guided()");
    showTips("Guided!");
});
$(".avoid_fly").on("click", function () {
    hideWin();
    client.write("lidar.Guided_Avoid()");
    showTips("Guided Avoid!");
});
$(".radio_d").on("click", function () {
    hideWin();
    client.write("vehicle.radio()");
    showTips("Radio!");
});
$(".gcs").on("click", function () {
    hideWin();
    client.write("vehicle.GCS()");
    showTips("Mission Control!");
});
$(".hovering").on("click", function () {
    hideWin();
    client.write("vehicle.set_channels_mid()");
    showTips("Set Channels Mid!");
});
// $(".change_video_url").on("click", function () {
//     var player = document.getElementById("player");
//     hideWin();
//     var fileName = 'rtmp://video.airforceuav.com:1935/live/livestream';
//     if($(this).hasClass("shen")){
//         fileName = "rtmp://live.hkstv.hk.lxdns.com/live/hks";
//         $(this).removeClass("shen");
//         $(".change_video_text")[0].innerText = "Jiang";
//     }else{
//         $(this).addClass("shen");
//         $(".change_video_text")[0].innerText = "Shen";
//     }
//     player.setMediaResourceURL(fileName)
// });
$(".back-home").on("click", function () {
    hideWin();
    client.write("vehicle.RTL()");
    showTips("Back Home!");
});
$(".download_path").on("click", function () {
    hideWin();
    clearPath();
    client.write("vehicle.download()");
    showTips("Download!");
});
$(".auto_path").on("click", function () {
    hideWin();
    client.write("vehicle.AUTO()");
    showTips("AUTO!");
});
var route_mes;
$(".route_path").on("click", function () {
    hideWin();
    clearPath();
    dynamicLine(locationCurrent[1], locationCurrent[0], 3);
    map.removeEventListener("click", generate_message);
    route_mes = "Route(\"";
    map.addEventListener("click", generate_message);
    $(".take-off").css("display", "block"); 
    showTips("Route!");
});
$(".take-off").on("click", function (){
    route_mes= route_mes.substring(0,route_mes.length-1)
    route_mes += "\")";
    console.log(route_mes);
    client.write(route_mes);
    $(".take-off").css("display", "none");
    map.removeEventListener("click", generate_message);
})
$(".dn_de_submit").on("click", function () {
    var dn_text = $(".dn_text").val();
    var de_text = $(".de_text").val();
    var mes = "vehicle.set_target("+ dn_text + "," + de_text + ")";
    client.write(mes);
    showTips("DN:" + dn_text + " " + "DE:" + de_text);
    hideWin();
});
$(".test_function_submit").on("click", function () {
    var test_text= $(".test_text").val();
    var mes = test_text;
    client.write(mes);
    showTips(test_text);
    hideWin();
});
$(".hd_fw_submit").on("click", function () {
    console.log($(".heading_text"));
    var hd_text = $(".heading_text").val();
    var fw_text = $(".forward_text").val();
    var hd_fw_tip = "";
    if(hd_text){
        var mes = 'vehicle.condition_yaw('+ hd_text +')';
        client.write(mes);
        hd_fw_tip += "heading:" + hd_text + "°" 
        showTips("heading:" + hd_text + "°");
        hideWin();
    }
    if(fw_text){
        var mes = 'vehicle.forward('+ fw_text +')';
        client.write(mes);
        hd_fw_tip += "forword:" + fw_text + "s"
        hideWin();
    }
    showTips(hd_fw_tip);
    
});
$(".l-button").on("click", function () {
    hideWin();
    client.write("vehicle.set_gear(1)");
    showTips("Set gear low!");
});
$(".m-button").on("click", function () {
    hideWin();
    client.write("vehicle.set_gear(2)");
    showTips("Set gear mid!");
});
$(".h-button").on("click", function () {
    hideWin();
    client.write("vehicle.set_gear(3)");
    showTips("Set gear high!");
});
$(".brake").on("click", function () {
    client.write("vehicle.brake()");
    showTips("Brake!");
});
$(".turn-up").on("click", function () {
    client.write("vehicle.up_brake()");
    showTips("Turn up");
});
$(".turn-down").on("click", function () {
    client.write("vehicle.down_brake()");
    showTips("Turn down");
});
$(".turn-left").on("click", function () {
    client.write("vehicle.yaw_left_brake()");
    showTips("Turn left");
});
$(".turn-right").on("click", function () {
    client.write("vehicle.yaw_right_brake()");
    showTips("Turn right");
}); 

$(".roll-up").on("click", function () {
    client.write("vehicle.forward_brake()");
    showTips("Roll up");
});
$(".roll-down").on("click", function () {
    client.write("vehicle.backward_brake()");
    showTips("Roll down");
});
$(".roll-left").on("click", function () {
    client.write("vehicle.roll_left_brake()");
    showTips("Roll left");
});
$(".roll-right").on("click", function () {
    client.write("vehicle.roll_right_brake()");
    showTips("Roll right");
}); 
$(".cancel").on("click", function () {
    $('#ConfirmModal').modal('show');
    // slide 初始化
    var slider = new SliderUnlock(".slideunlock-slider", {
        labelTip: "Confirm To Cancel",
        successLabelTip: "Cancel",
        duration: 200   // 动画效果执行时间，默认200ms
    }, function(){
        $('#ConfirmModal').modal('hide');
        client.write("Cancel");
        showTips("Cancel");
        slider.reset();
    }, function(){
    });
    slider.init();  
});

$(".change").on("click", function () {
      var height = $(window).height();
      var width = $(window).width();
      if(width >= height*1.7251){
        height = width/1.7251;
      }else{
        width= height*1.7251;
      }
      console.log(height);
      console.log(width);
        if(!$(this).hasClass("video_mode")){
          $('#allmap').css({
              "width":"285px",
              "height":"165px",
              "position":"absolute",
              "right":"10px",
              "bottom":"10px"
            });
          $(this).addClass("video_mode");
          $("#test_desktop").css({
            "width":width,
            "height":height,
            "bottom":"0",
            "right": "0",
            "z-index": "-1"
          });
        }else{
            $('#allmap').css({
              "width":"100%",
              "height":"100%",
              "position":"relative",
              "right":"0",
              "margin-top":"60px"
            });
          $("#test_desktop").css({
            "position":"absolute",
            "width":"285px",
            "height":"165px",
            "right": "10px",
            "bottom": "10px",
            "z-index": "0"
          });
          $(this).removeClass("video_mode");
        }
});

// long press
$('.turn-up, .turn-left, .turn-right, .turn-down').longPress(function(){
    
});

// keyboard
$("#test_text,#dn_text, #de_text, #heading_text, #forward_text, #dis_text, #vs_text").on("click", function () {
    new KeyBoard($(this)[0]);
});

// for router
function generate_message(e){
    route_mes += (e.point.lat + "+" + e.point.lng + ",");
    console.log(route_mes);
    dynamicLine(e.point.lng, e.point.lat, 3);
}
  
/*
* add line
* points: {"lng":lng,"lat":lat,"status":1,"id":id} 
* flag: 2 for plane, 3 for path
*/
function addLine(points, flag){  
  
    var linePoints = [],pointsLen = points.length,i,polyline;  
    if(pointsLen == 0){
        return;  
    }  
    // 创建标注对象并添加到地图     
    for(i = 0;i <pointsLen;i++){  
        linePoints.push(new BMap.Point(points[i].lng,points[i].lat));  
    }  

    if(flag == 2){
        polyline = new BMap.Polyline(linePoints, {strokeColor:"red", strokeWeight:5, strokeOpacity:1});   //创建折线  
    }else if(flag == 3){
        polyline = new BMap.Polyline(linePoints, {strokeColor:"green", strokeWeight:5, strokeOpacity:0.6});   //创建折线  
    }
    map.addOverlay(polyline);   //增加折线  
}  

/*
* add new point
* lng: 经度
* lat: 纬度
* flag: 2 for plane, 3 for path
*/  
function dynamicLine(lng, lat, flag){  
    var lng = lng;
    var lat = lat;
    var id = getRandom(1000);  
    var point = {"lng":lng,"lat":lat,"status":1,"id":id}
    var len;  
  
    if(flag == 2){
        points.push(point); 
        len = points.length;  
        points = points.slice(len-2, len);//最后两个点用来画线。
        addLine(points, flag);//增加轨迹线 
    }else if(flag == 3){
        path_points.push(point);
        len = path_points.length; 
        path_points = path_points.slice(len-2, len);//最后两个点用来画线。
        var point_1 = new BMap.Point(lng, lat); 
        var point_2 = new BMap.Point(path_points[0].lng, path_points[0].lat); 
        if(len > 1){
            var dis = map.getDistance(point_1, point_2).toFixed(0);
            path_num ++;
            markPath(point_1, path_num, dis);
            markLocation(point_1);
        }else{
            markPath(point_1, 1, 0);
        }
        addLine(path_points, flag);//增加轨迹线 
    }
}  

/*
* get random data
* n : 
*/  
function getRandom(n){  
    return Math.floor(Math.random()*n+1)  
}  
/*
* 根据点信息实时更新地图显示范围，让轨迹完整显示。设置新的中心点和显示级别
* bPoints : bPoints.push(new BMap.Point(longtitude,latitude)); 
*/  
function setZoom(bPoints){  
    var view = map.getViewport(eval(bPoints));  
    var mapZoom = view.zoom;   
    var centerPoint = view.center;   
    map.centerAndZoom(centerPoint, mapZoom);  
}

/*
* mark the location
* lng: 经度
* lat: 纬度
*/  
function markLocation(new_point){
    // add icon
    // var pt = new BMap.Point(lng, lat);
    // var myIcon = new BMap.Icon("http://developer.baidu.com/map/jsdemo/img/fox.gif");
    // var marker2 = new BMap.Marker(pt,{icon:myIcon});  // 创建标注
    // map.addOverlay(marker2); 

    // map.clearOverlays(); 
    // 去掉之前标注的点
    map.removeOverlay(path_marker);
    // var myIcon = new BMap.Icon("http://developer.baidu.com/map/jsdemo/img/fox.gif");
    path_marker = new BMap.Marker(new_point);  // 创建标注
    // marker = new BMap.Marker(new_point,{icon:myIcon});  // 创建标注
    map.addOverlay(path_marker);              // 将标注添加到地图中
    // map.panTo(new_point);     //让地图平滑移动至新中心点
}

/*
* mark the path point
* lng: 经度
* lat: 纬度
*/  
function markPath(new_point, num, dis){
    var title = "NO." + String(num) + " : " + String(dis) + "m";
    var opts = {
        position : new_point,
        offset   : new BMap.Size(0, 0)    //设置文本偏移量
    }
    var label = new BMap.Label(title, opts);  // 创建文本标注对象
        label.setStyle({
             color : "red",
             fontSize : "20px",
             height : "30px",
             padding : "2px 120px 2px 1px",
             lineHeight : "30px",
             fontFamily:"微软雅黑",
             'border-radius' : "3px",
             background : "rgba(255,255,255,0.8)"
         });
    map.addOverlay(label);              // 将标注添加到地图中
}

/*
* mark the location use plane Symbol
* lng: 经度
* lat: 纬度
* head: 顺时针旋转角度（eg:90）
*/ 
function markPlane(lng, lat, head){
    map.removeOverlay(plane_marker);
    var new_point = new BMap.Point(lng, lat);
    plane_marker = new BMap.Marker(new BMap.Point(new_point.lng,new_point.lat), {
      // 初始化小飞机Symbol
      icon: new BMap.Symbol(BMap_Symbol_SHAPE_PLANE, {
        scale: 2.5,
        rotation: head,
        strokeOpacity: 0.7,
        fillOpacity: 1,
        fillColor: "#f00"
      })
    });
    map.addOverlay(plane_marker);
    map.panTo(new_point);     //让地图平滑移动至新中心点
}
// clear the path
function clearPath(){
    path_points = [];
    map.clearOverlays(); 
}
// hide the modal
function hideWin(){
    $('#win').modal('hide');
    
}
// modal hide 时触发
$('.modal').on('hide.bs.modal', function (e) {
    $("#__w_l_h_v_c_z_e_r_o_divid").remove();
})
// modal hide 后触发
$('.modal').on('hidden.bs.modal', function (e) {
    $("input").each(function(){
        $(this)[0].value = "";
    });
})

/*
* show alert
* mes : String
*/
function showTips(mes){
    $(".tip_mes").text(mes);
    $("#myAlert").show();
    $("#myAlert").fadeOut(2000);
}

if(locationCurrent.length == 0){
    // google 的
    // if (!navigator.geolocation){
    //     console.log("您的浏览器不支持地理位置");
    // }

    // navigator.geolocation.getCurrentPosition(success, error);
    // function success(position) {
    //     var latitude  = position.coords.latitude;
    //     var longitude = position.coords.longitude;

    //     markPlane(longitude, latitude, 0);
    //     console.log(longitude + "," +latitude);
    //     locationCurrent[0] = latitude;
    //     locationCurrent[1] = longitude;
    // };
    // function error(err) {
    //     console.log(err);
    // };

    // 初始定位使用浏览器位置
    // var geolocation = new BMap.Geolocation();
    // geolocation.getCurrentPosition(function(r){
    // if(this.getStatus() == BMAP_STATUS_SUCCESS){
    //     markPlane(r.point.lng, r.point.lat, 0);
    //         locationCurrent[0] = r.point.lat;
    //         locationCurrent[1] = r.point.lng;

    // }else {
    //   alert('failed'+this.getStatus());
    // }        
    // },{enableHighAccuracy: true})

    // 定位对象
    var geoc = new BMap.Geocoder();
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function(r){
        if(this.getStatus() == BMAP_STATUS_SUCCESS){
            markPlane(r.point.lng, r.point.lat, 0);
            console.log(r.point);
            locationCurrent[0] = r.point.lat;
            locationCurrent[1] = r.point.lng;
            // setLocation(r.point);
        }else {
        }
    },{enableHighAccuracy: true});

}
map.enableScrollWheelZoom();//滚轮放大缩小 
add_control();

//添加地图类型和缩略图
function add_control(){
    var mapType1 = new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP,BMAP_HYBRID_MAP]});
    var mapType2 = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});
    var overView = new BMap.OverviewMapControl();
    var overViewOpen = new BMap.OverviewMapControl({isOpen:true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT});
    map.addControl(mapType1);          //2D图，卫星图
    map.addControl(mapType2);          //左上角，默认地图控件
    map.setCurrentCity("北京");        //由于有3D图，需要设置城市哦
    map.addControl(overView);          //添加默认缩略地图控件
    map.addControl(overViewOpen);      //右下角，打开
}




