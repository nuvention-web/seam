//FUNCTIONS FOR PROGRESS BAR DURING MEETING
$(document).ready(function(){
    var timer= $('#progressValues').val();
    var strVals=timer.split(',');
    var intVals=new Array();
    for(var i = 0; i < strVals.length; i++){
        intVals[i] =parseInt(strVals[i]);
         intVals[i] *=60;
        if(i>1)
        {
            intVals[i]+=intVals[i-1];
        }
    };
    $("#progressBar").progressBar({
        timeLimit: intVals[0], 
        limit:intVals

    });
    $('#countdownTimer').countdown({until: intVals[0],compact: true,format: 'MS'});
});

(function ($) {
    $.fn.progressBar = function (options) {
        var settings = $.extend({}, $.fn.progressBar.defaults, options);

        this.each(function () {
            $(this).empty();
            var barContainer = $("<div>").addClass("progress progress-striped");
            var bar = $("<div>").addClass("progress-bar").addClass(settings.baseStyle)
                .attr("role", "progressbar")
                .attr("aria-valuenow", "0")
                .attr("aria-valuemin", "0")
                .attr("aria-valuemax", settings.timeLimit);

            bar.appendTo(barContainer);
            barContainer.appendTo($(this));
            
            var start = new Date();
            var limit = settings.timeLimit * 1000;
            var interval = window.setInterval(function () {
            var elapsed = new Date() - start;
            bar.width(((elapsed / limit) * 100) + "%");
            if(elapsed <= settings.limit[1]*1000){
                bar.removeClass(settings.baseStyle)
                .addClass(settings.baseStyle);
            }else if(elapsed <= settings.limit[2]*1000){
                bar.addClass(settings.style2);
            }else if(elapsed <= settings.limit[3]*1000){
                bar.removeClass(settings.baseStyle)
                .addClass(settings.style4);
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
        completeStyle: 'progress-bar-success',//bootstrap progress bar style at completion of timer
        limit:[30,10,5]
    };
}(jQuery));
