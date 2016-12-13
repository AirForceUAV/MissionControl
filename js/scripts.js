const {ipcRenderer} = require('electron')

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
    		}
    	});
        console.log($(this).find('.input-error').length);
    	if($(this).find('.input-error').length == 0){
            ipcRenderer.send('index_view', 'ping');
        }
    });
    
    
});


function ReadFile(data) {
    $("#form-username").attr("value",data);
}        
var xhr = new XMLHttpRequest();
xhr.onload = function () {            
    ReadFile(xhr.responseText);
};
try {
    xhr.open("get", "../js/.UserCredential", true);
    xhr.send();
}
catch (ex) {
    ReadFile(ex.message);
}        
