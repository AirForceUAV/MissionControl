const net = require('net');
const path = process.env.HOME + "/.UDS"+"_mc";
const client = net.connect({ path: path});

// init 
var eChart = echarts.init(document.getElementById('e-attr'));

// 地图数据准备,  
var points = [];//原始点信息数组  
var bPoints = [];//百度化坐标数组。用于更新显示范围。  
  
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
            max:3000,
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
                    fontSize: 5,
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
            data:[{value: 40, name: 'km/h'}]
        }
    ]
};
eChart.setOption(option);

// 百度地图API功能
var map = new BMap.Map("allmap");
var point = new BMap.Point(116.331398,39.897445);
map.centerAndZoom(point,12);

var geolocation = new BMap.Geolocation();
geolocation.getCurrentPosition(function(r){
if(this.getStatus() == BMAP_STATUS_SUCCESS){
  var mk = new BMap.Marker(r.point);
  map.addOverlay(mk);
  map.panTo(r.point);
  console.log('您的位置：'+r.point.lng+','+r.point.lat);
}
else {
  alert('failed'+this.getStatus());
}        
},{enableHighAccuracy: true})

map.enableScrollWheelZoom();//滚轮放大缩小  



client.on('data', (data) => {
    // console.log(data.de)
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

    // EKF = data.EKF;
    // Mode = data.Mode;
    // Status = data.SystemStatus;

    // attitude
    var attitude = data.Gimbal.split(",");

    // x = document.getElementById("EKF");  //查找元素
    // x.innerHTML="EKF : " + EKF + " ";

    // y = document.getElementById("Mode");  //查找元素
    // y.innerHTML="Mode : " + Mode + " ";

    // z = document.getElementById("Status");  //查找元素
    // z.innerHTML="System Status : " + Status + " ";

    var location = data.LocationGlobal.split(",");
    // 纬度
    var latitude = location[0];
    // 经度
    var longtitude = location[1];
    // 高度
    var height = location[2];
    // distance
    var distance = data.DistanceFromHome;

    var rpm = data.RPM;

    // data
    $("#battery-number")[0].innerText = current + "%";
    $("#battery-level")[0].innerText = level + "V";
    $("#dis-value")[0].innerText = distance;
    $("#height-value")[0].innerText = height;
    $("#x-value")[0].innerText = xv;
    $("#y-value")[0].innerText = yv;
    $("#z-value")[0].innerText = zv;

    // ecahrts
    option.series[0].data[0].value = rpm;
    eChart.setOption(option,true);

    dynamicLine(longtitude, latitude);

    // battery
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
client.on('error', (error) => {
    console.log(error.toString());
});
         
if (option && typeof option === "object") {
eChart.setOption(option, true);
} 

$(".guide_fly").on("click", function () {
    alert("guided fly");
    client.write("vehicle.Guided()");
});
$(".avoid_fly").on("click", function () {
    alert("back home");
    client.write("lidar.Guided_Avoid()");
});
$(".radio_d").on("click", function () {
    alert("radio");
    client.write("vehicle.radio()");
});
$(".gcs").on("click", function () {
    alert("gcs");
    client.write("vehicle.GCS()");
});
$(".hovering").on("click", function () {
    alert("hovering");
    client.write("vehicle.set_channels_mid()");
});
$(".back-home").on("click", function () {
    alert("back home");
    client.write("vehicle.RTL()");
});

$(".glyphicon-cloud-upload").on("click", function () {
    $("#win").css("display", "block");
});
$(".dn_de_submit").on("click", function () {
    var dn_text = $(".dn_text").val();
    var de_text = $(".de_text").val();
    var mes = "vehicle.set_target("+ dn_text + "," + de_text + ")";
    client.write(mes);
});
$(".test_function_submit").on("click", function () {
    var test_text= $(".test_text").val();
    var mes = test_text;
    client.write(mes);
});
$(".hd_fw_submit").on("click", function () {
    var hd_text = $(".heading_text").val();
    var fw_text = $(".forward_text").val();
    if(hd_text){
        var mes = 'vehicle.condition_yaw('+ hd_text +')';
        client.write(mes);
    }
    if(fw_text){
        var mes = 'vehicle.forward('+ fw_text +')';
        client.write(mes);
    }
    
});
$(".l-button").on("click", function () {
    client.write("vehicle.set_gear(1)");
});
$(".m-button").on("click", function () {
    client.write("vehicle.set_gear(2)");
});
$(".h-button").on("click", function () {
    client.write("vehicle.set_gear(3)");
});
$(".brake").on("click", function () {
    client.write("vehicle.brake()");
});
$(".turn-up").on("click", function () {
    alert("turn up");
    client.write("vehicle.up_brake()");
});
$(".turn-down").on("click", function () {
    alert("turn down");
    client.write("vehicle.down_brake()");
});
$(".turn-left").on("click", function () {
    alert("turn left");
    client.write("vehicle.yaw_left_brake()");
});
$(".turn-right").on("click", function () {
    alert("turn right");
    client.write("vehicle.yaw_right_brake()");
}); 

$(".roll-up").on("click", function () {
    alert("turn up");
    client.write("vehicle.forward_brake()");
});
$(".roll-down").on("click", function () {
    alert("turn down");
    client.write("vehicle.backward_brake()");
});
$(".roll-left").on("click", function () {
    alert("turn left");
    client.write("vehicle.roll_left_brake()");
});
$(".roll-right").on("click", function () {
    alert("turn right");
    client.write("vehicle.roll_right_brake()");
}); 
$(".cancel").on("click", function () {
    alert("cancel");
    client.write("Cancel");
});

$(".glyphicon-th-list").on("click", function () {
    // set page
    // // header.style.display = "none";
    // otherView.style.display = "none";
    // overlay.style.display = "block";
    // navList.style.display = "block";

    // $(".overlay").on("click", function () {
    //     navList.style.display = "none";
    //     overlay.style.display = "none";
    //     // header.style.display = "block";
    //     otherView.style.display = "block";
    // });
    if($("#win").css("display") == "none"){
        $("#win").css("display", "block");
    }else{
        $("#win").css("display", "none");
    }
});
$(".change").on("click", function () {
      var height = $(window).height() - 60;
      var width = $(window).width();

      console.log(thePlayer)
        if(!$(this).hasClass("video_mode")){
          thePlayer.resize(width, height);
          $('#allmap').css({
              "width":"250px",
              "height":"150px",
              "position":"absolute",
              "right":"10px",
              "bottom":"10px"
            });
          $(this).addClass("video_mode");
          $("#container").css({
            "right": "0",
            "bottom": "0",
            "z-index": "-1"
          });
        }else{
          thePlayer.resize(250, 150);
          $('#allmap').css({
              "width":"100%",
              "height":"100%",
              "position":"relative",
              "margin-top":"60px"
            });
          $("#container").css({
            "right": "10px",
            "bottom": "10px",
            "z-index": "0"
          });
          $(this).removeClass("video_mode");
        }
});

$("#dn_text, #de_text, #heading_text, #forward_text").on("click", function () {
    new KeyBoard($(this)[0]);
});

  
//添加线  
function addLine(points){  
  
    var linePoints = [],pointsLen = points.length,i,polyline;  
    if(pointsLen == 0){
        return;  
    }  
    // 创建标注对象并添加到地图     
    for(i = 0;i <pointsLen;i++){  
        linePoints.push(new BMap.Point(points[i].lng,points[i].lat));  
    }  
  
    polyline = new BMap.Polyline(linePoints, {strokeColor:"red", strokeWeight:5, strokeOpacity:0.5});   //创建折线  
    map.addOverlay(polyline);   //增加折线  
}  

//新的点，加入到轨迹中。  
function dynamicLine(lng, lat){  
    var lng = lng;
    var lat = lat;
    var id = getRandom(1000);  
    var point = {"lng":lng,"lat":lat,"status":1,"id":id}  
    var makerPoints = [];  
    var newLinePoints = [];  
    var len;  
  
    makerPoints.push(point);              
    // addMarker(makerPoints);//增加对应该的轨迹点  
    points.push(point);  
    bPoints.push(new BMap.Point(lng,lat));  
    len = points.length;  
    newLinePoints = points.slice(len-2, len);//最后两个点用来画线。  
  
    addLine(newLinePoints);//增加轨迹线  
    setZoom(bPoints);  
}  

// 获取随机数  
function getRandom(n){  
    return Math.floor(Math.random()*n+1)  
}  

//根据点信息实时更新地图显示范围，让轨迹完整显示。设置新的中心点和显示级别  
function setZoom(bPoints){  
    var view = map.getViewport(eval(bPoints));  
    var mapZoom = view.zoom;   
    var centerPoint = view.center;   
    map.centerAndZoom(centerPoint,mapZoom);  
} 

var mapType1 = new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP,BMAP_HYBRID_MAP]});
var mapType2 = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});

var overView = new BMap.OverviewMapControl();
var overViewOpen = new BMap.OverviewMapControl({isOpen:true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT});

//添加地图类型和缩略图
function add_control(){
    map.addControl(mapType1);          //2D图，卫星图
    map.addControl(mapType2);          //左上角，默认地图控件
    map.setCurrentCity("北京");        //由于有3D图，需要设置城市哦
    map.addControl(overView);          //添加默认缩略地图控件
    map.addControl(overViewOpen);      //右下角，打开
}
add_control();


