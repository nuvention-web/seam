 $(document).ready(function(){ 
  if(window.innerWidth >= 800 && window.innerHeight >= 600) {
    //Navbar Color Change Function
    var scroll = 0;            
    $(document).scroll(function() { 
       // var changePos=$("#home-page").height()-1000;
       var changePos=100;
        scroll = $(this).scrollTop();
        if(scroll > changePos) {
            var progress= $('.progress').css('width');
            var progressFrustration = $('.progress-bar-success').css('width')
            $(".navbar").css('background-color', 'rgba(0,0,0,.8)');
            $(".navbar").css('background-color', 'rgba(0,0,0,.8)');
            $(".navbar").css('transition', 'background-color 1.5s ease-in-out');
        } 
        else {
            $(".navbar").css('background-color', 'transparent');
        }
    });
};
});