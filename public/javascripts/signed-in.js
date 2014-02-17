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
              $('.bar').animate({ width: "100%" },2000);

               $('form[name="TNForm"]').submit(function(event){
                 var value = $(this).attr('value');
                 var taskMembers= new Array();
                 var formData = $("#TNForm" + value).serializeArray();
                 var notes = formData[2].value;
                 var action = '/addnote';
                 var flag = 0; //0 if notes 1 if task
                 
                 for(var i = 3; i < formData.length; i++){
                  if(formData[i].value != ""){
                    taskMembers.push(formData[i].value);
                    flag = 1;
                    action = '/addtask';
                    var newVal = i - 3;
                    var inputName = '#assigned' + newVal;
                    console.log($(inputName));
                    $(inputName).val('');
                  }
                 };

                 var url = location.protocol + "//" + location.host + action;
                    $.ajax({
                           type: "POST",
                           url: url,
                           data: formData, // serializes the form's elements.
                           success: function(data)
                           {
                             if(flag == 0){
                              notesList[value].innerHTML += '<h5 class="text-left margin-right-2p text-capital">' + notes + '</h5>';
                              $('#notes' + value)[0].value = '';
                             }
                             else{
                              for(var i=0; i < taskMembers.length; i++){
                                document.getElementById('tasksList').innerHTML += '<div class="row margin-left-1p bg-ltgray"><div class="col-md-9"><h3 class="text-left text-black text-capital">'+ notes + ' --- ' + taskMembers[i] + '</h3></div><div class="col-md-3 text-center margin-top-1p"><a href="#" class="text-h4 text-black margin-left-5p">EDIT</a><a href="#" class="text-h4 text-black margin-left-2p">REVIEW</a></div></div>';
                                $('#notes' + value)[0].value = '';
                                chooseVisibility('meetingMember' + value);
                              }
                             }                  
                           }
                         });
                 return false; 
               });

              $('#memberList img').click(function() {
                var value = $(this).attr('value');
                var inputName = 'assigned' + $(this).attr('name')
                if($(this).css('border-radius')=='0px'){
                  $(this).css('border-radius','1px');
                  $(this).css("border","1px solid rgb(204,51,51)");
                  $(this).css("filter",'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 0\'/></filter></svg>#grayscale")');
                  $(this).css("-webkit-filter","grayscale(0%)");
                  $('[id="' + inputName + '"]').val(value);
                }
                else{
                  
                  $(this).css('border-radius','0px');
                  $(this).css("border","none");
                  $(this).css("filter","url(filters.svg#grayscale)");
                  $(this).css("filter","gray");
                  $(this).css("-webkit-filter","grayscale(1);");
                  $('[id="' + inputName + '"]').val('');
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

function addTimer(time){
  $("#progressTimer").progressBar({
     timeLimit: time*60
  });
}

function addNote(number){
  var form = 'TNForm';
  document.getElementsByName(form)[number].action = location.protocol + "//" + location.host + '/addnote';
  document.getElementsByName(form)[number].submit();
  return true;
};

function addTask(number){
  var form = 'TNForm';
  document.getElementsByName(form)[number].action = location.protocol + "//" + location.host + '/addTask';
  document.getElementsByName(form)[number].submit();
  return true;
};