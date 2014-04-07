//FUNCTIONS FOR ASYNC UPDATE OF MEETINGS
var taskInput;
$(document).ready(function(){

	$('.attendeeMember img').click(function() {
        var value = $(this).attr('value');
        var e = document.getElementById(taskInput);
        if (e.value.indexOf(value) !=-1) {
       	
		}else{
			e.value= e.value+ value+", ";
 		}
        return false;
    });

     $('.attendeeMember h4').click(function() {
        var value = $(this).attr('value');
        var e = document.getElementById(taskInput);
        if (e.value.indexOf(value) !=-1) {
       	
		}else{
			e.value= e.value+ value+", ";
 		}
 		return false;
    });
	//FUNCTION: ASYNC UPDATE OF NOTES
	$('form[name="TNForm"]').submit(function(event){
		var value = $(this).attr('value');
		var taskMembers= new Array();
		var formData = $("#TNForm" + value).serializeArray();
		console.log(formData);
		var notes = formData[1].value;
		var action = '/dashboard/meetings/start/addNote';
		var flag = 0; //0 if notes 1 if task
		if(formData[2].value != ''){
			action = '/dashboard/meetings/start/addTask';
			flag = 1;
		}
		// for(var i = 3; i < formData.length; i++){
		// 	if(formData[i].value != ""){
		// 		taskMembers.push(formData[i].value);
		// 		flag = 1;
		// 		action = '/dashboard/meetings/start/addTask';
		// 		var newVal = i - 3;
		// 		var inputName = '#assigned' + newVal;
		// 		console.log($(inputName));
		// 		$(inputName).val('');
		// 	}
		//  };
		var url = location.protocol + "//" + location.host + action;
		$.ajax({
			type: "POST",
			url: url,
			data: formData, // serializes the form's elements.
			success: function(data){
				if(flag == 0){
					if(notesList[value] == undefined){
						notesList.innerHTML += '<h5 class="text-left margin-right-2p ">' + notes + '</h5>';
						notesList.scrollTop = notesList.scrollHeight;
						$('#notes' + value)[0].value = '';
					}
					else{
						notesList[value].innerHTML += '<h5 class="text-left margin-right-2p">' + notes + '</h5>';
						notesList[value].scrollTop = notesList[value].scrollHeight;
						$('#notes' + value)[0].value = '';
					}
				}
				else{
					if(notesList[value] == undefined){
						notesList.innerHTML += '<h5 class="text-left margin-right-2p"> Task: ' + notes + '</h5>';
						notesList.scrollTop = notesList.scrollHeight;
						$('#notes' + value)[0].value = '';
					}
					else{
						notesList[value].innerHTML += '<h5 class="text-left margin-right-2p"> Task: ' + notes + '</h5>';
						notesList[value].scrollTop = notesList[value].scrollHeight;
						$('#notes' + value)[0].value = '';
					}
					value = parseInt(value) + 1;
					showTaskForm("taskPerson" + value, "addTask" + value);
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


function showTaskForm(id, buttonid){
	console.log(id + " " + buttonid);
	var e = document.getElementById(id);
	var button = document.getElementById(buttonid);
	var input = document.getElementById(id + "Input");
	taskInput = id + "Input";
	console.log("type = " + button.type);
	if(e.style.display == 'inline'){
		e.style.display = 'none';
		button.type = 'button';
		input.value = '';
		console.log("type = " + button.type);
	}
	else{
		e.style.display = 'inline';
		button.type = 'submit';
		input.value = '';
		console.log("type = " +  button.type);
	}
};