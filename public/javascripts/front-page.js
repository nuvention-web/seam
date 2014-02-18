 $(document).ready(function(){ 

$( document.body ).on( 'click', '.dropdown-menu li', function( event ) {
 
   var $target = $( event.currentTarget );
 
   $target.closest( '.btn-group' )
      .find( '[data-bind="label"]' ).text( $target.text() )
         .end()
      .children( '.dropdown-toggle' ).dropdown( 'toggle' );
 
   return false;
 
});

            var scroll = 0;            
            $(document).scroll(function() { 
                var changePos=$("#home-page").height();
                scroll = $(this).scrollTop();
                
                if(scroll > changePos) {
                    var progress= $('.progress').css('width');
                    var progressFrustration = $('.progress-bar-success').css('width');
                     $(".navbar").css('background-color', 'rgba(0,0,0,.8)');
                     $(".navbar").css('background-color', 'rgba(0,0,0,.8)');
                     $(".navbar").css('transition', 'background-color 1.5s ease-in-out');
                } else {
                    $(".navbar").css('background-color', 'transparent');
                }
            });

            $('.attendeeMember img').click(function() {
                var value = $(this).attr('value');
                var input = $('#taskPerson');
                input.val(input.val() + value + ', ');
                return false;
            });
             $('.attendeeMember h5').click(function() {
                var value = $(this).attr('value');
                var input = $('#taskPerson');
                input.val(input.val() + value + ', ');
                return false;
            });
             $('#admin-btn').click(function(){
              $('.visible-login').fadeOut(300);
              $('.hidden-login').delay(300).fadeIn(700);              
              });
              $('#admin-btn-2').click(function(){
                  $('.hidden-login').fadeOut(300);
                  $('.visible-login').delay(300).fadeIn(700);
              });
    });
    $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
        || location.hostname == this.hostname) {

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