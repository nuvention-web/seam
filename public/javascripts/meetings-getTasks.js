$(document).ready(function(){

	$('form[name="meetingTasks"]').submit(function(event){
		var value = $(this).attr('value');
		var taskMembers= new Array();
		var formData = $("#meetingTasks" + value).serializeArray();
		console.log(formData);
		var action = '/dashboard/tasks/current';
		var url = location.protocol + "//" + location.host + action;

		$.ajax({
			type: "POST",
			url: url,
			data: formData, // serializes the form's elements.
			success: function(data){
				console.log(data.tasks);
				taskContainer.innerHTML = '';
				for(var i = 0; i < data.tasks.length; i++){
					taskContainer.innerHTML += '<div class="row margin-0 border-black-outline"><div class="col-md-12"><h5 class="text-left text-black">' + data.tasks[i].meetingTask + " - " + data.tasks[i].meetingPerson + '</h5></div></div>'
				}
			}
		});
	return false; 
	});
});