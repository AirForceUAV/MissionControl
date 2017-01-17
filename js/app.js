// init baidu map
global.map = new BMap.Map("allmap",{enableMapClick:false});
// 设置位置
var point = new BMap.Point(116.331398,39.897445);
map.centerAndZoom(point,17);

// 当前位置记录
global.locationCurrent = [];

// 当前位置在地图上的标注
global.plane_marker;

// 路径标注
global.path_marker;

// 地面站位置
global.gcs_marker;

// home 标注
global.home_marker;

// 地图数据
// 原始点信息数组  
global.points = [];
// 路径数据
global.path_points = []; 
//百度化坐标数组。用于更新显示范围
global.bPoints = [];  

// 路径num
global.path_num = 1;

// 是否开启下载路径模式
global.openDowload = false;


var dynamicLine = require("./map/dynamicLine.js");
global.client = require("./net/connect.js");

require("./tools/bootstrap.min.js");
require("./tools/longpress.js");
require("./tools/keyboard.js");
require("./desktop.js");
         
// order
$(".location").on("click", function () {  
    setZoom(bPoints);
}); 
$(".guide_fly").on("click", function () {
    hideWin();
    client.write("vehicle.Guided()");
    showTips("Guided模式!");
});
$(".avoid_fly").on("click", function () {
    hideWin();
    client.write("lidar.Guided_Avoid()");
    showTips("避障模式!");
});
$(".radio_d").on("click", function () {
    hideWin();
    client.write("vehicle.radio()");
    showTips("遥控器模式!");
});
$(".gcs").on("click", function () {
    hideWin();
    client.write("vehicle.GCS()");
    showTips("地面站模式!");
});
$(".hovering").on("click", function () {
    hideWin();
    client.write("vehicle.set_channels_mid()");
    showTips("悬停设置!");
});
$(".back-home").on("click", function () {
    hideWin();
    client.write("vehicle.RTL()");
    showTips("返航!");
});
$(".download_path").on("click", function () {
    hideWin();
    openDowload = true;
    client.write("vehicle.download()");
    showTips("下载路径!");
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
    route_mes = "vehicle.Route(\"";
    map.addEventListener("click", generate_message);
    $(".take-off").css("display", "block"); 
    showTips("路径规划!");
});
$(".take-off").on("click", function (){
    route_mes= route_mes.substring(0,route_mes.length-1)
    route_mes += "\")";
    console.log(route_mes);
    client.write(route_mes);
    $(".take-off").css("display", "none");
    map.removeEventListener("click", generate_message);
    showTips("路径规划结束!");
})
$(".dn_de_submit").on("click", function () {
    var dn_text = $(".dn_text").val();
    var de_text = $(".de_text").val();
    var mes = "vehicle.set_target("+ dn_text + "," + de_text + ")";
    client.write(mes);
    showTips("向北:" + dn_text + " " + "向东:" + de_text);
    hideWin();
});
$(".test_function_submit").on("click", function () {
    var test_text= $("#test_text").val();
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
        hd_fw_tip += "转向:" + hd_text + "°" 
        showTips("转向:" + hd_text + "°");
        hideWin();
    }
    if(fw_text){
        var mes = 'vehicle.forward('+ fw_text +')';
        client.write(mes);
        hd_fw_tip += "向前:" + fw_text + "s"
        hideWin();
    }
    showTips(hd_fw_tip);
    
});
$(".l-button").on("click", function () {
    hideWin();
    client.write("vehicle.set_gear(1)");
    showTips("低挡位!");
});
$(".m-button").on("click", function () {
    hideWin();
    client.write("vehicle.set_gear(2)");
    showTips("中档位!");
});
$(".h-button").on("click", function () {
    hideWin();
    client.write("vehicle.set_gear(3)");
    showTips("高档位!");
});
$(".brake").on("click", function () {
    client.write("vehicle.brake()");
    showTips("刹车!");
});
$(".turn-up").on("click", function () {
    client.write("vehicle.up_brake()");
    showTips("向上！");
});
$(".turn-down").on("click", function () {
    client.write("vehicle.down_brake()");
    showTips("向下！");
});
$(".turn-left").on("click", function () {
    client.write("vehicle.yaw_left_brake()");
    showTips("向左！");
});
$(".turn-right").on("click", function () {
    client.write("vehicle.yaw_right_brake()");
    showTips("向右！");
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
        labelTip: "确认取消？",
        successLabelTip: "取消",
        duration: 200   // 动画效果执行时间，默认200ms
    }, function(){
        $('#ConfirmModal').modal('hide');
        client.write("Cancel");
        showTips("取消！");
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
  
// hide the modal
function hideWin(){
    $('#win').modal('hide');
    $('#Sensors').modal('hide');
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
global.showTips = function(mes){
    $(".tip_mes").text(mes);
    $("#myAlert").show();
    $("#myAlert").fadeOut(1500);
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

// clear the path
global.clearPath = function(){
    path_num = 1;
    var len = path_lines.length;
    while (len--) {
        map.removeOverlay(path_lines[len]);
    }
    path_points = [];
    path_lines = [];
    // map.clearOverlays(); 
}



