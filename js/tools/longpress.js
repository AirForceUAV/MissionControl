$.fn.longPress = function(fn) {
    var timeout = undefined;
    var $this = this;
    for(var i = 0;i<$this.length;i++){
        $this[i].addEventListener('mousedown', function(event) {
            var className = this.className;
            timeout = setTimeout(function(){
                if(className.slice(0,4) == "turn"){
                    $('#longPressModal').modal('show');
                    $('#longPressModal .dis_vs_submit').on("click", function(){
                        client.write(className + " dis:" + "vs:");
                        showTips(className + " 距离: " + " 速度:");
                        $('#longPressModal').modal('hide');
                    });
                }
            }, 800);  //长按时间超过800ms，则执行传入的方法
            }, true);
        $this[i].addEventListener('mouseup', function(event) {
            clearTimeout(timeout);  //长按时间少于800ms，不会执行传入的方法
            }, true);
    }
}

$('.roll-up')[0].addEventListener('mousedown', function(event) {
    console.log("mousedown");
    if(openSemiAuto == true){
        // if(intBrake){
        //     clearInterval(intBrake);
        // }
        intRoll =setInterval(function() {
        　　console.log("roll");
            client.write("lidar.semi_auto(1)");
            showTips("lidar.semi_auto(1)");
        }, 500);
    }
}, true);
$('.roll-up')[0].addEventListener('mouseup', function(event) {
    if(openSemiAuto == true){
        console.log("mouseup");
        if(intRoll){
            clearInterval(intRoll);
        }
        // intBrake =setInterval(function() {
        // 　　console.log("brake");
        //     client.write("vehicle.brake()");
        //     showTips("vehicle.brake()");

        // }, 100);
    } 
}, true);
$('.roll-up')[0].addEventListener('mouseout', function(event) {
    if(openSemiAuto == true){
        console.log("mouseup");
        if(intRoll){
            clearInterval(intRoll);
        }
        // intBrake =setInterval(function() {
        // 　　console.log("brake");
        //     client.write("vehicle.brake()");
        //     showTips("vehicle.brake()");

        // }, 100);
    } 
}, true);
$('.roll-left')[0].addEventListener('mousedown', function(event) {
    console.log("mousedown");
    if(openSemiAuto == true){
        // if(intBrake){
        //     clearInterval(intBrake);
        // }
        intRoll =setInterval(function() {
        　　console.log("roll");
            client.write("lidar.semi_auto(16)");
            showTips("lidar.semi_auto(16)");
        }, 500);
    }
}, true);
$('.roll-left')[0].addEventListener('mouseup', function(event) {
    if(openSemiAuto == true){
        console.log("mouseup");
        if(intRoll){
            clearInterval(intRoll);
        }
        // intBrake =setInterval(function() {
        // 　　console.log("brake");
        //     client.write("vehicle.brake()");
        //     showTips("vehicle.brake()");
        // }, 100);
    } 
}, true);
$('.roll-left')[0].addEventListener('mouseout', function(event) {
    if(openSemiAuto == true){
        console.log("mouseup");
        if(intRoll){
            clearInterval(intRoll);
        }
        // intBrake =setInterval(function() {
        // 　　console.log("brake");
        //     client.write("vehicle.brake()");
        //     showTips("vehicle.brake()");
        // }, 100);
    } 
}, true);
$('.roll-down')[0].addEventListener('mousedown', function(event) {
    console.log("mousedown");
    if(openSemiAuto == true){
        // if(intBrake){
        //     clearInterval(intBrake);
        // }
        intRoll =setInterval(function() {
        　　console.log("roll");
            client.write("lidar.semi_auto(2)");
            showTips("lidar.semi_auto(2)");
        }, 500);
    }
}, true);
$('.roll-down')[0].addEventListener('mouseup', function(event) {
    if(openSemiAuto == true){
        console.log("mouseup");
        if(intRoll){
            clearInterval(intRoll);
        }
        // intBrake =setInterval(function() {
        // 　　console.log("brake");
        //     client.write("vehicle.brake()");
        //     showTips("vehicle.brake()");

        // }, 100);
    } 
}, true);
$('.roll-down')[0].addEventListener('mouseout', function(event) {
    if(openSemiAuto == true){
        console.log("mouseup");
        if(intRoll){
            clearInterval(intRoll);
        }
        // intBrake =setInterval(function() {
        // 　　console.log("brake");
        //     client.write("vehicle.brake()");
        //     showTips("vehicle.brake()");

        // }, 100);
    } 
}, true);
$('.roll-right')[0].addEventListener('mousedown', function(event) {
    console.log("mousedown");
    if(openSemiAuto == true){
        // if(intBrake){
        //     clearInterval(intBrake);
        // }
        intRoll =setInterval(function() {
        　　console.log("roll");
            client.write("lidar.semi_auto(32)");
            showTips("lidar.semi_auto(32)");
        }, 500);
    }
}, true);
$('.roll-right')[0].addEventListener('mouseup', function(event) {
    if(openSemiAuto == true){
        console.log("mouseup");
        if(intRoll){
            clearInterval(intRoll);
        }
        // intBrake =setInterval(function() {
        // 　　console.log("brake");
        //     client.write("vehicle.brake()");
        //     showTips("vehicle.brake()");

        // }, 100);
    } 
}, true);
$('.roll-right')[0].addEventListener('mouseout', function(event) {
    if(openSemiAuto == true){
        console.log("mouseup");
        if(intRoll){
            clearInterval(intRoll);
        }
        // intBrake =setInterval(function() {
        // 　　console.log("brake");
        //     client.write("vehicle.brake()");
        //     showTips("vehicle.brake()");

        // }, 100);
    } 
}, true);