var start = new Date();
var progress = window.setInterval(function() {
    var $bar = $('.bar');
    
    var limit = 20 * 1000;
	var step=0;
    if (elapsed>=limit) {
        alert('hi');
       window.clearInterval(progress);
        $('.progress').removeClass('active');
    } else {
        var elapsed = new Date() - start;
        $bar.text(elapsed);
        $bar.width(((elapsed / limit) * 1000) + "%");
    }

}, 250);