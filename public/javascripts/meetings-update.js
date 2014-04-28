
$(document).ready(function(){
//FUNCTIONS FOR ASYNC UPDATE OF MEETINGS
	socket = io.connect("127.0.0.1:3000");
	// var socket = io.connect("http://www.getseam.co");
	name = $("input[name='name']").attr('value');
	userId = $("input[name='userId']").attr('value');
	meetingId = $("input[name='meetingId']").attr('value');

	socket.emit("join", name, userId);

	socket.emit("startMeeting", name, userId, meetingId);

	socket.on("update", function(msg){
		console.log(msg);
	});

	socket.on("newNoteOrTask", function(who, msg, value){
		console.log(msg);
		if(msg[0] == '@'){
			if(notesList[value] == undefined){
				allTasks.innerHTML += '<h5 class="text-left text-blue margin-right-2p">' + msg + '</h5>';
				notesList.scrollTop = notesList.scrollHeight;
			}
			else{
				allTasks[value].innerHTML += '<h5 class="text-left text-blue margin-right-2p">' + msg + '</h5>';
				notesList[value].scrollTop = notesList[value].scrollHeight;
			}
		}
		else{
			if(notesList[value] == undefined){
				allNotes.innerHTML += '<h5 class="text-left margin-right-2p ">' + msg + '</h5>';
				notesList.scrollTop = notesList.scrollHeight;
			}
			else{
				allNotes[value].innerHTML += '<h5 class="text-left margin-right-2p">' + msg + '</h5>';
				notesList[value].scrollTop = notesList[value].scrollHeight;
			}
		}
	});

	console.log('name: ' + name + ' user: ' + userId + ' meetingId: ' + meetingId);

	// array used for autocomplete
	var attendeeTags = new Array();
	// adding all out attendees to the autocompelete source
	$("img[name='attendee']").each(function(){
		attendeeTags.push($(this).attr('value'));
		// console.log(attendeeTags);
	});
	//autocomeplete function


    $("input[name='taskAssignee']")
      // don't navigate away from the field on tab when selecting an item
      .bind( "keydown", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).data( "ui-autocomplete" ).menu.active ) {
          event.preventDefault();
        }
      })
      .autocomplete({
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
					socket.emit("send",  notes, value);
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
						allTasks[value].innerHTML += '<h5 class="text-left text-blue margin-right-2p"> @ ' + taskAssignee +' '+task + ' </h5>';
						notesList[value].scrollTop = notesList[value].scrollHeight;
						$('#taskAssignee' + value)[0].value = '';
						$('#taskName' + value)[0].value = '';
						$('#notes' + value)[0].focus();
					}

					socket.emit("send",  '@ ' + taskAssignee + ' ' + task, value, meetingId);
				}                
			}
		});
	return false; 
	});

	// $('#oneNote').click(function(){
	// 	var value = $(this).attr('value');
	// 	console.log(value);
	// 	var input = "noteInput" + value;
	// 	$(this).hide();
	// 	$('form[name=' + input + ']').show();
	// });

	// $('#oneTask').click(function(){
	// 	var value = $(this).attr('value');
	// 	var input = "taskInput" + value;
	// 	$(this).hide();
	// 	$('form[name=' + input + ']').show();
	// });
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
}

function finishMeeting(){
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
    })
}