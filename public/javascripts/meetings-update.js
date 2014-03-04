//FUNCTIONS FOR ASYNC UPDATE OF MEETINGS
$(document).ready(function(){
	//FUNCTION: ASYNC UPDATE OF NOTES
	$('form[name="TNForm"]').submit(function(event){
		var value = $(this).attr('value');
		var taskMembers= new Array();
		var formData = $("#TNForm" + value).serializeArray();
		var notes = formData[2].value;
		var action = '/dashboard/meetings/start/addNote';
		var flag = 0; //0 if notes 1 if task
		for(var i = 3; i < formData.length; i++){
			if(formData[i].value != ""){
				taskMembers.push(formData[i].value);
				flag = 1;
				action = '/dashboard/meetings/start/addTask';
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
			success: function(data){
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

function addAttendee(){
	var attendeeName = document.getElementById('nameHolder').value;
	var attendeeEmail = document.getElementById('emailHolder').value;
	var string = '<div class="row"><input type="hidden" name="attendeeName" value="' + attendeeName + '"><input type="hidden" name="attendeeEmail" value="' + attendeeEmail + '"><div class="col-md-4 margin-top-5p"><img src="../../../images/member.png" class="width-50x height-50x border-50p float-right"></div><div class="col-md-8"><h4 class="text-black text-left margin-top-5p">' + attendeeName +'</h4></div></div>';

	document.getElementById('attendeeList').innerHTML += string;
	document.getElementById('nameHolder').value = '';
	document.getElementById('emailHolder').value = '';
	document.getElementById('addNewAttendee').style.display = 'none';
	document.getElementById('nameHolder').focus();

};

function deleteAttendee(){

};

function showAttendeeForm(){
	var e = document.getElementById('addNewAttendee');
	var textField = document.getElementById('attendeeName');
	if(e.style.display == 'inline'){
			e.style.display = 'none';
	}
	else{
			e.style.display = 'inline';
			textField.focus();
	}
};