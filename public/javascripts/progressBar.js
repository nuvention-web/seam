var progress = setInterval(function() {
    var $bar = $('.bar');
    var max=$('.progress').width();
    var step=max/1;
    if ($bar.width()==max) {
        clearInterval(progress);
        $('.progress').removeClass('active');
    } else {
        $bar.width($bar.width()+step);   

    }
    $bar.text($bar.width() + "%");
}, 1000);
