 $(document).ready(function(){ 

    //Navbar Login Fade-In-Out Function
    $('#admin-btn').click(function(){
        $('.visible-login').fadeOut(300);
        $('.hidden-login').delay(300).fadeIn(700);              
    });
    $('#admin-btn-2').click(function(){
        $('.hidden-login').fadeOut(300);
        $('.visible-login').delay(300).fadeIn(700);
    });


});

//Auto Scroll Function
$('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'')|| location.hostname == this.hostname){
    var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
          $('html,body').animate({
              scrollTop: target.offset().top
            }, 800);
            return false;
        }
  }
});