
var interval;

$(document).ready(function(){
	
	$('body').on('keypress', '.noEnterSubmit', function(e){ 
		if ( e.which == 13 ) {
			e.preventDefault();
		}
	});

	startTimer();

	//FUNCTIONS FOR ASYNC UPDATE OF MEETINGS
	// socket = io.connect("127.0.0.1:3000");
	socket = io.connect("http://www.getseam.co");
	name = $("input[name='name']").attr('value');
	userId = $("input[name='userId']").attr('value');
	meetingId = $("input[name='meetingId']").attr('value');

	// elapsedTimeArray;

	window.onbeforeunload = function(){
		return "You are about to leave an unfinished meeting. Attendees still in meeting will not be able to edit the agenda.";
	};

	window.onunload = function(){
		socket.emit("leaveMeetingCreator", name, userId, meetingId);
		console.log("you just left the meeting");
	};

	socket.emit("join", name, userId, meetingId);

	setTimeout(function(){
		socket.emit("startMeeting", name, userId, meetingId);
	}, 0);

	socket.on("update", function(msg){
		console.log(msg);
	});

	socket.on("userJoined", function(msg){
		console.log(msg);
		$.notify(msg.toUpperCase(),
			{className: "info", autoHideDelay: 3000, globalPosition: 'top center'}
		);
	});

	socket.on("userLeft", function(msg){
		console.log(msg);
		$.notify(msg.toUpperCase(),
			{className: "info", autoHideDelay: 3000, globalPosition: 'top center'}
		);
	});

	socket.on("newUserNeedsTime", function(userId, Id){
		console.log(userId + ' needs time for this meeting (' + Id + ')');
		if(meetingId === Id){
			var remainingTime = getRemainingTime();
			socket.emit("timeForUser", remainingTime, userId, Id);
		}
	});

	socket.on("meetingRestarted", function(msg, Id, meetingId){
		console.log(msg);
	});

	socket.on("newNote", function(note, value, Id){
		if(meetingId === Id){
			console.log(note);
			if(notesList[value] == undefined){
				allNotes.innerHTML += '<h5 class="text-left margin-right-2p ">' + note + '</h5>';
				notesList.scrollTop = notesList.scrollHeight;
			}
			else{
				allNotes[value].innerHTML += '<h5 class="text-left margin-right-2p">' + note + '</h5>';
				notesList[value].scrollTop = notesList[value].scrollHeight;
			}
		}
	});

	socket.on("newTask", function(taskAssignee, task, value, Id){
		if(meetingId === Id){
			console.log(taskAssignee + task);
			if(notesList[value] == undefined){
				allTasks.innerHTML += '<h5 class="text-left text-blue margin-right-2p"> <span class="text-h5 text-normal text-blue">@ ' + taskAssignee + '</span> ----- '+task + ' </h5>';
				notesList.scrollTop = notesList.scrollHeight;
			}
			else{
				allTasks[value].innerHTML += '<h5 class="text-left text-blue margin-right-2p"> <span class="text-h5 text-normal text-blue">@ ' + taskAssignee + '</span> ----- '+task + ' </h5>';
				notesList[value].scrollTop = notesList[value].scrollHeight;
			}
		}
	});

	// array used for autocomplete
	var attendeeTags = new Array();
	// adding all out attendees to the autocompelete source
	$("img[name='attendee']").each(function(){
		attendeeTags.push($(this).attr('value'));
		// console.log(attendeeTags);
	});
	
	//autocomeplete function
	$("textarea[name='taskAssignee']")
	  // don't navigate away from the field on tab when selecting an item
	.bind( "keydown", function( event ) {
		if ( event.keyCode === $.ui.keyCode.TAB && $( this ).data( "ui-autocomplete" ).menu.active ) {
			event.preventDefault();
		}
	}).autocomplete({
		minLength: 0,
		source: function( request, response ) {
			// delegate back to autocomplete, but extract the last term
			response( $.ui.autocomplete.filter(
			attendeeTags, extractLast( request.term ) ) );
		},
		focus: function() {
			// prevent value inserted on focus
			return false;
		},
		noResults: '',
		results: function() {},
		select: function( event, ui ) {
			var terms = split( this.value );
			// remove the current input
			terms.pop();
			// add the selected item
			terms.push( ui.item.value );
			// add placeholder to get the comma-and-space at the end
			terms.push( "" );
			this.value = terms.join( ", " );
			return false;
		}
	});

	var defaultWeek = getWeekFromNow();
	// $("input[name='taskDueDate']").each(function( index ) {
	// 	var height = $("div[id='noteEntry" + index + "']").height() + 'px';
	// 	console.log(height);
	// 	$(this).css('height', height);
	// });
	//for calender of datepicker
	$("input[name='taskDueDate']").datetimepicker({
		pickTime: false,
		defaultDate: defaultWeek
	});

	$('textarea[name="notes"]').keypress(function (event) {
		if (event.keyCode == 13 && event.shiftKey) {
			var value = $(this).attr('value');
			$("#TNForm" + value).submit();
		}
	});

	$('textarea[name="taskName"]').keypress(function (event) {
		if (event.keyCode == 13 && event.shiftKey) {
			var value = $(this).attr('value');
			$("#TNForm" + value).submit();
		}
	});

	$('textarea[name="taskDueDate"]').keypress(function (event) {
		if (event.keyCode == 13 && event.shiftKey) {
			var value = $(this).attr('value');
			$("#TNForm" + value).submit();
		}
	});

	//FUNCTION: ASYNC UPDATE OF NOTES
	$('form[name="TNForm"]').submit(function(event){
		var value = $(this).attr('value');
		var formData = $("#TNForm" + value).serializeArray();
		console.log(formData);
		var notes = formData[1].value;
		var taskAssignee = formData[2].value;
		var task = formData[3].value;

		var action = '/dashboard/meetings/start/addNote';
		var flag = 0; //0 if notes 1 if task
		if(taskAssignee != ''){
			console.log('this is a task')
			action = '/dashboard/meetings/start/addTask';
			flag = 1;
		}

		var url = location.protocol + "//" + location.host + action;
		$.ajax({
			type: "POST",
			url: url,
			data: formData, // serializes the form's elements.
			success: function(data){
				if(flag == 0){
					if(notesList[value] == undefined){
						allNotes.innerHTML += '<h5 class="text-left margin-right-2p ">' + notes + '</h5>';
						notesList.scrollTop = notesList.scrollHeight;
						$('#notes' + value)[0].value = '';
					}
					else{
						allNotes[value].innerHTML += '<h5 class="text-left margin-right-2p">' + notes + '</h5>';
						notesList[value].scrollTop = notesList[value].scrollHeight;
						$('#notes' + value)[0].value = '';
					}
					socket.emit("sendNote", notes, value, meetingId);
				}
				else{
					if(notesList[value] == undefined){
						allTasks.innerHTML += '<h5 class="text-left text-blue margin-right-2p"> <span class="text-h5 text-normal text-blue">@ ' + taskAssignee + '</span> ----- '+task + ' </h5>';
						notesList.scrollTop = notesList.scrollHeight;
						$('#taskAssignee' + value)[0].value = '';
						$('#taskName' + value)[0].value = '';
						$('#notes' + value)[0].focus();
					}
					else{
						allTasks[value].innerHTML += '<h5 class="text-left text-blue margin-right-2p"> <span class="text-h5 text-normal text-blue">@ ' + taskAssignee + '</span> ----- '+task + ' </h5>';
						notesList[value].scrollTop = notesList[value].scrollHeight;
						$('#taskAssignee' + value)[0].value = '';
						$('#taskName' + value)[0].value = '';
						$('#notes' + value)[0].focus();
					}
					socket.emit("sendTask", taskAssignee, task, value, meetingId);
				}
				$('.switch_disable').click();               
			}
		});
	return false; 
	});

});
				
//FUNCTION: ADD NOTE TO MEETING INTERFACE
function addNote(number){
	var form = 'TNForm';
	document.getElementsByName(form)[number].action = location.protocol + "//" + location.host + '/addnote';
	document.getElementsByName(form)[number].submit();
	return true;
};

//FUNCTION: ADD TASK TO MEETING INTERFACE
function addTask(number){
	var form = 'TNForm';
	document.getElementsByName(form)[number].action = location.protocol + "//" + location.host + '/addTask';
	document.getElementsByName(form)[number].submit();
	return true;
};

function getRemainingTime(){
	return $('span[class="countdown-row countdown-amount"]').html()
}

function split( val ) {
	return val.split( /,\s*/ );
};

function extractLast( term ) {
	return split( term ).pop();
};


function getWeekFromNow(){
	var today = new Date();
	today.setDate(today.getDate()+7);
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd < 10) {
		dd = '0' + dd;
	} 

	if(mm < 10) {
		mm = '0' + mm;
	} 

	today = mm + '/' + dd + '/' + yyyy;
	return today;
};

function finishMeeting(){
	window.onbeforeunload = function(){};
	window.onunload = function(){};
	var url = location.protocol + "//" + location.host + '/dashboard/meetings/end';
	var data = new Array();
	data.push({
		"name" : "meetingId",
		"value" : meetingId
	});

	$.ajax({
		type: "POST",
		url: url,
		data: data,
		success: function(data){
			socket.emit('finishMeeting', name, userId, meetingId);
			window.location = window.location.origin + "/dashboard"
		}
	});
};

function startTimer(){
	intVals=new Array();
	waitVals=new Array();
	elapsedVals = new Array(); //in milliseconds
	elapsedTime = 0; //in seconds
	elapsedVals[0] = 0;
	$('input[name="timeLeft"]').each(function( index ) {
		elapsedVals[index + 1] = $(this).attr('value');
		elapsedTime = elapsedTime + (parseInt($(this).attr('value'))/1000);
	});

	$.notify.defaults({ className: "success" ,globalPosition:"top center" });

	console.log("this is the elapsedVals: " + elapsedVals);
	console.log("this is the elapsedTime: " + elapsedTime);
	
	var timer= $('#progressValues').val();
	var strVals=timer.split(',');
	
	for(var i = 0; i < strVals.length; i++){
		if(i === 0){
			intVals[i] = parseInt(strVals[i]) * 60;
			waitVals[i] = 2;
		}
		else{
			intVals[i] = parseInt(strVals[i]) * 60;
			waitVals[i] = intVals[i] + waitVals[i-1] - (parseInt(elapsedVals[i])/1000) + i;
			if(waitVals[i] < 2){
				waitVals[i] = 3 + i;
			}
		}
	};
   //SET AGENDA ITEM TIMEOUTSattendeeMinimize

    console.log("this is the waitVals: " + waitVals);

	$('#attendeeMinimize').each(function() {
		var tis = $(this);
		var state = false;
		var hiddenBox= tis.next('div');
		
		if(i>1){
			hiddenBox.hide().css('height','auto').slideUp();
		}
		
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
			
			if(i>1){
				hiddenBox.hide().css('height','auto').slideUp();
			}
			
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
	$('.countdownTimer').countdown({until: intVals[0]-elapsedTime,compact: true,format: 'MS'});
};


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
	var value =  $(progID).attr('value');
	var currentElapsed = 0;
	if(elapsedVals[i] != undefined){
		currentElapsed =  elapsedVals[i];
	}
	setTimeout(function(){
		if(prev>=1){
			$.notify("AGENDA ITEM "+ prev+ " DONE", { className: "success" ,globalPosition:"top center" }); 
			$('#agendaItem'+i).next('div').slideToggle(true);
			document.getElementById('alertSound').play();
			clearInterval(interval);
		};
		
		if(i==total){
			$('#endCirc').addClass("bg-green");
			document.getElementById('alertSound').play();
		}
		else{
			// console.log("this is the elapsed time: " + parseInt(currentElapsed));
			$(progCir).addClass("bg-green"); 
			$(progID).progressBar({timeLimit: timeLimits,limit:intVals, elapsed: currentElapsed, value: value});
		}
	}, waitVals[i-1] * 1000 );
};

(function ($) {
	$.fn.progressBar = function (options) {
		var settings = $.extend({}, $.fn.progressBar.defaults, options);

		this.each(function (index) {
			var url = location.protocol + "//" + location.host + '/dashboard/meetings/start/updateTime';
			var data = new Array();
			data.push({
				"name" : "meetingId",
				"value" : meetingId
			});
			data.push({
				"name" : "value",
				"value" : settings.value
			});
			//console.log("more elapsed: " + settings.elapsed);
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
			// console.log("the value: " + settings.value);
			var start = new Date();
			var limit = settings.timeLimit * 1000;
			var value = settings.value + 1;
			var elapsed = new Date() - start + parseInt(settings.elapsed);
			var count = 0

			interval = setInterval(function () {
				elapsed = new Date() - start + parseInt(settings.elapsed);
				bar.height(((elapsed / limit) * 100) + "%");
				if(elapsed <= limit){
					bar.removeClass(settings.baseStyle)
					   .addClass(settings.baseStyle);
				}
				else {
					bar.removeClass(settings.baseStyle)
					   .removeClass(settings.warningStyle)
					   .addClass(settings.completeStyle);
					settings.onFinish.call(this);
				}
				if(count == 22){
					data[2] = {
						"name" : "timeExpired",
						"value" : elapsed 
					};
					if(getRemainingTime() != "00:00"){
						$.ajax({
							type: "POST",
							url: url,
							data: data,
							success: function(data){
								// console.log("updated the time");
							}
						});
						count = 0;
					}
				}
				else{
					count++;
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
		style3:'bg-1',
		style4:'bg-1',
		warningStyle: 'progress-bar-danger',  //bootstrap progress bar style in the warning phase
		completeStyle: 'bg-1',//bootstrap progress bar style at completion of timer
		limit:[30,10,5],
		elapsed: 0,
		value: 0,
	};
}(jQuery));