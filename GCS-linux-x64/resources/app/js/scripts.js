const {ipcRenderer} = require('electron')

var mc_guid,fc_guid;

var redis = require("redis");
var client = redis.createClient();

// client.get("SelfGUID",function(err, replay){
//     $("#form-username").attr("value",replay);
//     mc_guid = replay;
// });

// client.get("PairKey",function(err, replay){
//     if(replay){
//         ipcRenderer.send('index_view', 'ping');
//     }
// });

// 避开配对
ipcRenderer.send('index_view', 'ping');

jQuery(document).ready(function() {
    
    /*
        Fullscreen background
    */
    $.backstretch("../img/backgrounds/1.jpg");
    
    /*
        Form validation
    */
    $('.login-form input[type="text"], .login-form input[type="password"], .login-form textarea').on('focus', function() {
        $(this).removeClass('input-error');
    });
    
    $('.login-form').on('submit', function(e) {
        $(this).find('input[type="text"], input[type="password"], textarea').each(function(){
            if( $(this).val() == "" ) {
                e.preventDefault();
                $(this).addClass('input-error');
            }
            else {
                $(this).removeClass('input-error');
                fc_guid = $(this).val();
                $.ajax({
                    type: "POST",
                    url: "http://airforceuav.com:8080/pair",
                    data: {
                        mc_guid : mc_guid,
                        fc_guid : fc_guid
                    },
                    success: function(data){
                        ipcRenderer.send('index_view', 'ping');
                        console.log(data);
                    },
                    error: function(data){
                        alert("error");
                        console.log(data);
                    }
                });
            }
        });
        console.log($(this).find('.input-error').length);
        if($(this).find('.input-error').length == 0){      
            // ipcRenderer.send('index_view', 'ping');
        }
    });
    
    
});


// function ReadFile(data) {
//     $("#form-username").attr("value",data);
// }        
// var xhr = new XMLHttpRequest();
// xhr.onload = function () {            
//     ReadFile(xhr.responseText);
// };
// try {
//     xhr.open("get", "../js/.UserCredential", true);
//     xhr.send();
// }
// catch (ex) {
//     ReadFile(ex.message);
// }




