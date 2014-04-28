 $(document).ready(function(){ 
    $('body').on('keypress', '.noEnterSubmit', function(e){ 
           if ( e.which == 13 ) {e.preventDefault();}

    });
});
//FUNCTIONS FOR PROGRESS BAR DURING MEETING
var intVals=new Array();
var waitVals=new Array();
var elapsedVals = new Array();
elapsedTime = 0;

$('input[name="timeLeft"]').each(function( index ) {
    elapsedVals[index] = $(this).attr('value');
    elapsedTime = elapsedTime + (parseInt($(this).attr('value'))/1000);
});

$(document).ready(function(){ 
    $.notify.defaults({ className: "success" ,globalPosition:"top center" });
    var timer= $('#progressValues').val();
    var strVals=timer.split(',');
    
    for(var i = 0; i < strVals.length; i++){
        intVals[i] =parseInt(strVals[i]);
        waitVals[i]=0;
        intVals[i] *=60;
         if(i>1){
            intVals[i] =parseInt(strVals[i])*60;
            waitVals[i]=intVals[i-1]+waitVals[i-1];
         }
    };
   waitVals[strVals.length]=intVals[0];
   //SET AGENDA ITEM TIMEOUTSattendeeMinimize

     $('#attendeeMinimize').each(function() {
                var tis = $(this);
                var state = false;
                var hiddenBox= tis.next('div');
                if(i>1)
                    hiddenBox.hide().css('height','auto').slideUp();
            tis.click(function() {
              state = !state;
              toggleID=tis.next('.answer');
              toggleID.slideToggle(state);
              hiddenBox.slideToggle(state);
              tis.toggleClass('active',state);
            });
          });



    for(var i=1; i<=strVals.length;i++){
       $('#agendaItem'+i).each(function() {
                var tis = $(this);
                var state = false;
                var hiddenBox= tis.next('div');
                if(i>1)
                    hiddenBox.hide().css('height','auto').slideUp();
            tis.click(function() {
              state = !state;
              toggleID=tis.next('.answer');
              toggleID.slideToggle(state);
              hiddenBox.slideToggle(state);
              tis.toggleClass('active',state);
            });
          });
        setAgendaDelay(i, strVals.length);
    };
    //ENDING AGENDA ITEM
    $('#countdownTimer').countdown({until: intVals[0]-elapsedTime,compact: true,format: 'MS'});
});
function setAgendaDelay(i, total){
    var prev=i-1;
    var progID="#progressBar"+i;
    var progCir="#progressCircle"+i; 
    var agendaID="#agendaNote"+i;
    var notesID="#notes"+prev;
    var notesButtonID="#noteSubmit"+prev;
    var taskButtonID="#taskSubmit"+prev;
    var taskPersonID="#taskPersonInput"+prev;
    var taskPersonAddID="#addTask"+prev;
    var timeLimits=intVals[i];
    var elapsed = 0;
    if(elapsedVals[i-1] != undefined){
        elapsed = elapsedVals[i-1];
    }
    setTimeout(function(){
        console.log(prev);
        console.log()
            if(prev>=1){
                $.notify("AGENDA ITEM "+ prev+ " DONE"); 
                $('#agendaItem'+i).next('div').slideToggle(true);
                document.getElementById('alertSound').play();
            };
            if(i==total){
                $('#endCirc').addClass("bg-green"); 
                document.getElementById('alertSound').play();
            }else{ 
            $(progCir).addClass("bg-green"); 
            $(progID).progressBar({timeLimit: timeLimits,limit:intVals})
        }
    },waitVals[i] * 1000 - parseInt(elapsed));
}


(function ($) {
    $.fn.progressBar = function (options) {
        var settings = $.extend({}, $.fn.progressBar.defaults, options);

        this.each(function (index) {
            console.log("more index: " + index);
            $(this).empty();
            var barContainer = $("<div>").addClass("progress progress-striped progress-vertical-line");
            var bar = $("<div>").addClass("progress-bar").addClass(settings.baseStyle)
                .attr("role", "progressbar")
                .attr("aria-valuenow", "0")
                .attr("aria-valuemin", "0")
                .attr("aria-valuemax", settings.timeLimit)
                .width("100%")
                .height("0%");

            bar.appendTo(barContainer);
            barContainer.appendTo($(this));
            console.log(settings.limit);
            var start = new Date();
            var limit = settings.timeLimit * 1000;
            var interval = window.setInterval(function () {
            var elapsed = new Date() - start + 30000;
            //console.log(elapsed);
            bar.height(((elapsed / limit) * 100) + "%");
            if(elapsed <= settings.limit[1]*1000){
                bar.removeClass(settings.baseStyle)
                .addClass(settings.baseStyle);
            }else if(elapsed <= settings.limit[2]*1000){
                bar.addClass(settings.style2);
            }else if(elapsed <= settings.limit[3]*1000){
                bar.removeClass(settings.baseStyle)
                .addClass(settings.style3);
            }
                if (elapsed >= limit) {
                    window.clearInterval(interval);
                    bar.removeClass(settings.baseStyle)
                       .removeClass(settings.warningStyle)
                       .addClass(settings.completeStyle);

                    settings.onFinish.call(this);
                }

            }, 500);

        });

        return this;
    };

    $.fn.progressBar.defaults = {
        timeLimit: 60,  //total number of seconds
        warningThreshold: 5,  //seconds remaining triggering switch to warning color
        onFinish: function () {},  //invoked once the timer expires
        baseStyle: 'bg-1',  //bootstrap progress bar style at the beginning of the timer
        style2:'bg-2',
        style3:'bg-1',
        style4:'bg-1',
        warningStyle: 'progress-bar-danger',  //bootstrap progress bar style in the warning phase
        completeStyle: 'bg-1',//bootstrap progress bar style at completion of timer
        limit:[30,10,5]
    };
}(jQuery));