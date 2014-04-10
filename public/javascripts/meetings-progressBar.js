//FUNCTIONS FOR PROGRESS BAR DURING MEETING
var intVals=new Array();
var waitVals=new Array();

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
   
   //SET AGENDA ITEM TIMEOUTS
    for(var i=1; i<=strVals.length;i++){
       setAgendaDelay(i, strVals.length);
    };
    //ENDING AGENDA ITEM
    $('#countdownTimer').countdown({until: intVals[0],compact: true,format: 'MS'});
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
    setTimeout(function(){
            if(prev>=1){
                $.notify("AGENDA ITEM "+ prev+ " DONE"); 

                $(notesID).removeClass("border-orange");
                $(notesID).addClass("text-black");                
                $(notesID).addClass("outline-black");

                $(notesButtonID).removeClass("border-orange");
                $(notesButtonID).addClass("border-black");
                $(notesButtonID).addClass("text-black");

                $(taskButtonID).removeClass("border-orange");
                $(taskButtonID).addClass("border-black");
                $(taskButtonID).addClass("text-black");

                $(taskPersonID).removeClass("border-orange");
                $(taskPersonID).addClass("text-black");
                $(taskPersonID).addClass("outline-black");
                
                $(taskPersonAddID).removeClass("border-orange");
                $(taskPersonAddID).addClass("border-black");
                $(taskPersonAddID).addClass("text-black");

            };
            if(i==total){
                $('#endCirc').addClass("bg-green"); 
            }else{
            $(agendaID).removeClass("bg-gray-out");  
            $(progCir).addClass("bg-green"); 
            $(progID).progressBar({timeLimit: timeLimits,limit:intVals})
        }
    },waitVals[i]*1000);
}


(function ($) {
    $.fn.progressBar = function (options) {
        var settings = $.extend({}, $.fn.progressBar.defaults, options);

        this.each(function () {
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
            
            var start = new Date();
            var limit = settings.timeLimit * 1000;
            var interval = window.setInterval(function () {
            var elapsed = new Date() - start;
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

            }, 250);

        });

        return this;
    };

    $.fn.progressBar.defaults = {
        timeLimit: 60,  //total number of seconds
        warningThreshold: 5,  //seconds remaining triggering switch to warning color
        onFinish: function () {},  //invoked once the timer expires
        baseStyle: 'bg-1',  //bootstrap progress bar style at the beginning of the timer
        style2:'bg-2',
        style3:'bg-3',
        style4:'bg-4',
        warningStyle: 'progress-bar-danger',  //bootstrap progress bar style in the warning phase
        completeStyle: 'bg-4',//bootstrap progress bar style at completion of timer
        limit:[30,10,5]
    };
}(jQuery));