// 路径线路
global.path_lines = [];

// map.addControl(new BMap.NavigationControl());
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
    //     console.log("!!!!!!!!!");
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
// var geoc = new BMap.Geocoder();
// var geolocation = new BMap.Geolocation();
// geolocation.getCurrentPosition(function(r){
//     if(this.getStatus() == BMAP_STATUS_SUCCESS){
//         geoc.getLocation(new BMap.Point(r.point.lng, r.point.lat), function(result){    
//              if (result){    
//                console.log(result.address);    
//              }    
//             });
//         markGCS(r.point.lng, r.point.lat);
//         locationCurrent[0] = r.point.lat;
//         locationCurrent[1] = r.point.lng;
//         // setLocation(r.point);
//     }else {
//     }
// },{enableHighAccuracy: true});

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
        path_lines.push(polyline);
    }
    map.addOverlay(polyline);   //增加折线  
}

/*
* add new point
* lng: 经度
* lat: 纬度
* flag: 2 for plane, 3 for path
*/  
global.dynamicLine = function(lng, lat, flag){  
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
    if(typeof(path_marker) != "undefined"){
		map.removeOverlay(path_marker);
	}
    // var myIcon = new BMap.Icon("http://developer.baidu.com/map/jsdemo/img/fox.gif");
    path_marker = new BMap.Marker(new_point);  // 创建标注
    // marker = new BMap.Marker(new_point,{icon:myIcon});  // 创建标注
    path_lines.push(path_marker);
    map.addOverlay(path_marker);              // 将标注添加到地图中
    // map.panTo(new_point);     //让地图平滑移动至新中心点
}

/*
* mark the path point
* lng: 经度
* lat: 纬度
*/  
global.markPath = function(new_point, num, dis){
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
    path_lines.push(label);
    map.addOverlay(label);              // 将标注添加到地图中
}

/*
* mark the location use plane Symbol
* lng: 经度
* lat: 纬度
* head: 顺时针旋转角度（eg:90）
*/ 
global.markPlane = function(lng, lat, head){
	if(typeof(plane_marker) != "undefined"){
		map.removeOverlay(plane_marker);
	}
    var new_point = new BMap.Point(lng,lat);
    plane_marker = new BMap.Marker(new_point, {
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

/*
* mark the home
* lng: 经度
* lat: 纬度
*/ 
global.markHome = function(lng, lat){
    if(typeof(home_marker) != "undefined"){
        map.removeOverlay(home_marker);
    }
    var new_point = new BMap.Point(lng,lat);
    //设置marker图标为水滴
    home_marker = new BMap.Marker(new_point, {
      // 指定Marker的icon属性为Symbol
      icon: new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
        scale: 2,//图标缩放大小
        fillColor: "orange",//填充颜色
        fillOpacity: 1//填充透明度
      })
    });

    map.addOverlay(home_marker);
}

/*
* mark the GCS
* lng: 经度
* lat: 纬度
*/ 
function markGCS(lng, lat){
    if(typeof(gcs_marker) != "undefined"){
        map.removeOverlay(gcs_marker);
    }
    var new_point = new BMap.Point(lng,lat);
    //设置marker图标为人字形
    gcs_marker = new BMap.Marker(new_point, {
      // 设置自定义path路径25325l99
      icon: new BMap.Symbol(BMap_Symbol_SHAPE_STAR, {
        scale: 2,
        fillColor: "red",
        fillOpacity: 0.8
      })
    });

    map.addOverlay(gcs_marker);
    map.panTo(new_point);     //让地图平滑移动至新中心点
}


// module.exports = dynamicLine, markPlane, markHome;