$.fn.longPress = function(fn) {
    var timeout = undefined;
    var $this = this;
    for(var i = 0;i<$this.length;i++){
        $this[i].addEventListener('touchstart', function(event) {
            var className = this.className;
            timeout = setTimeout(function(){
                if(className.slice(0,4) == "turn"){
                    $('#longPressModal').modal('show');
                    $('#longPressModal .dis_vs_submit').on("click", function(){
                        client.write(className + " dis:" + "vs:");
                        showTips(className + " dis: " + " vs:");
                        $('#longPressModal').modal('hide');
                    });
                }
            }, 800);  //长按时间超过800ms，则执行传入的方法
            }, true);
        $this[i].addEventListener('touchend', function(event) {
            clearTimeout(timeout);  //长按时间少于800ms，不会执行传入的方法
            }, true);
    }
}
