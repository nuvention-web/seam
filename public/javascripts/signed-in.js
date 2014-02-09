 $(document).ready(function(){       
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
              $('#meetingAgenda-btn').click(function(){
                if($('#meetingAgenda').css('display')=='none')
                {
                  $('#meetingAgenda.hidden-login').delay(300).fadeIn(700);
                }
                else{
                  $('#meetingAgenda.hidden-login').delay(300).fadeOut(700);  
                }
                            
              });
              $('#newAgenda-btn').click(function(){
                if($('#newAgenda').css('display')=='none')
                {
                  $('#meetingAgenda.hidden-login').delay(300).fadeOut(100);
                  $('#newAgenda.hidden-login').delay(300).fadeIn(700);
                }
                else{
                  $('#newAgenda.hidden-login').delay(300).fadeOut(700);  
                }
                            
              });
              $('#meetingMembers-btn').click(function(){ 
                  var value = $(this).attr('value');
                  alert(value);
                if($('#meetingMembers').css('display')=='none')
                { 
                  $('#meetingMembers.hidden-login').delay(300).fadeIn(300);
                }
                else{
                  
                  $('#meetingMembers.hidden-login').delay(300).fadeOut(700);  
                }
                            
              });

              $('#memberList img').click(function() {
                var value = $(this).attr('value');
                if($(this).css('border-radius')=='0px'){
                  
                  $(this).css('border-radius','1px');
                  $(this).css("border","1px solid rgb(204,51,51)");
                  $(this).css("filter",'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 0\'/></filter></svg>#grayscale")');
                  $(this).css("-webkit-filter","grayscale(0%)");
                }
                else{
                  
                  $(this).css('border-radius','0px');
                  $(this).css("border","none");

                  $(this).css("filter","url(filters.svg#grayscale)");
                  $(this).css("filter","gray");
                  $(this).css("-webkit-filter","grayscale(1);");
                }
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

function chooseVisibility(tabId){
      var value = $(this).attr('value');
      if($('#'+tabId+'-div').css('display')=='none')
                { 
                  $('#'+tabId+'-div.hidden-login').delay(300).fadeIn(300);
                }
                else{
                  
                  $('#'+tabId+'-div.hidden-login').delay(300).fadeOut(700);  
                }

};