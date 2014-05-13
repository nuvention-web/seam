 $(document).ready(function(){ 
	$('body').on('keypress', '.noEnterSubmit', function(e){ 
		   if ( e.which == 13 ) {e.preventDefault();}

	});
});
//FUNCTIONS FOR ADDING AGENDA ITEMS
$(function(){
	$("input[name='meetingDate']").datetimepicker();

	$('#agendaBox').on("focusin", 'input[name="duration"]', function() {
		pastTime = this.value;
	});
	
	$('#agendaBox').on("focusout", 'input[name="duration"]', function() {
		if($('input[name="meetingTime"]').val() == ''){
			console.log('in if');
			$('input[name="meetingTime"]').val(this.value);
		}
		else{
			if(pastTime == ""){
				console.log('in else if');
				var currentTime = parseInt($('input[name="meetingTime"]').val());
				console.log('currentTime: ' + currentTime);
				if(this.value == ""){
					var addTime = 0;
				}
				else{
					var addTime = parseInt(this.value);
				}
				var total = currentTime + addTime;
				$('input[name="meetingTime"]').val(total);
			}
			else{
				console.log('pastTime: ' + pastTime);
				var currentTime = parseInt($('input[name="meetingTime"]').val()) - parseInt(pastTime);
				console.log('currentTime: ' + currentTime);
				if(this.value == ""){
					var addTime = 0;
				}
				else{
					var addTime = parseInt(this.value);
				}
				console.log('addTime: ' + this.value);
				var total = currentTime + addTime;
				$('input[name="meetingTime"]').val(total);
			}
		}
	});
});

function addAgendaItemKeypress(e){
	if (!e) e = window.event; // needed for cross browser compatibility
	if(e.which == 13 || e.keyCode == 13)
	{
		addAgendaItem();
		return true;
	}
	else
		return false;
};

//FUNCTION: ADD MORE AGENDA ITEM FIELDS
function addAgendaItem(){
	var agendaBox = $('#agendaBox');
	var i = $('#agendaBox div').size();
	$('<div id="agendaItem'+ i + '" value= ' + i + '>'+
		'<div class="row">'+
		'<div class="col-md-1 margin-top-1p padding-bottom-2p margin-0 padding-0">'+
    		'<div class="height-100p width-100p">'+
      			'<div class="progress progress-striped progress-vertical-circle-bigger progress-striped active progress-success margin-top-n1x margin-bottom-0p">'+
        			'<div style="width:40px" class="bar"></div>'+
      					'</div></div></div>'+
		'<div class="col-md-7 margin-0 padding-0">'+
    		'<input id="makeMeeting'+i+'" type="text" name="agendaTopic" placeholder="Add agenda item" autocomplete="off" class="text-h3 noEnterSubmit height-30x form-control border-square border-none text-left text-blue bg-transparent cursor-pointer"/>'+
  				'</div>'+
  		'<div class="col-md-3">'+
  				'<input id="duration'+i+'" type="number" name="duration" class=" text-h3 noEnterSubmit height-30x form-control border-square border-none text-right bg-transparent cursor-pointer" placeholder= "Minutes" autocomplete="off" value="0" required/>'+
  				'</div>'+
  		'<div class="col-md-1 padding-0 text-center" style="margin-top:0.5%;">'+
  			'<a class="text-h2 text-normal text-gray-hover" href="#" onclick="removeAgenda(agendaItem'+ i + ');return false;"><i class="fa fa-times fa-md"></i> </a>'+
  			'</div></div>'+
	'<div class="row">'+
  		'<div class="col-md-1 margin-top-1p padding-bottom-2p margin-0 padding-0">'+
    		'<div class="height-100p width-100p">'+
    			'<div class="progress progress-striped progress-vertical-line-shorter progress-striped active progress-success margin-top-n1x margin-bottom-0p">'+
       				'<div style="width:40px" class="bar">'+
       				'</div></div></div></div>'+
  		'<div class="col-md-9 margin-0 padding-0">'+
    		'<div class="width-95p margin-top-1p overflow-scroll-y-auto max-height-150x">'+
     			'<textarea id="makeMeeting'+i+'" type="text" name="notes" rows="6" placeholder="Insert notes here" autocomplete="off" class="text-h4 height-30x form-control border-square border-none text-left bg-transparent cursor-pointer"/>'+
     			'</div></div></div></div>').appendTo(agendaBox);
	i++;
};

//FUNCTION: REMOVE AGENDA FIELDS GIVEN INPUT
function removeAgenda(tabId){
		var length = tabId.id.length
		var value = (tabId.id).slice(length - 2, length);
		var duration = '#duration' + value;
		var currentTime = parseInt($('input[name="meetingTime"]').val()) - parseInt($(duration).val());
		$('input[name="meetingTime"]').val(currentTime);
		// console.log($('input[name="duration"]').val());
        $(tabId).remove();
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

function addAttendee(){
	var i = $('#attendeeList div').size();
	var attendeeName = document.getElementById('nameHolder').value;
	var attendeeEmail = document.getElementById('emailHolder').value;
	var string = '<div class="row" id="attendee'+i+'"><input type="hidden" name="attendeeName" value="' + attendeeName + '"><input type="hidden" name="attendeeEmail" value="' + attendeeEmail + '"><div class="col-md-3 margin-top-5p"><img src="../../../images/member.png" class="width-50x height-50x border-50p float-right"></div><div class="col-md-6 margin-top-7p"><h4 class="text-black text-left margin-top-5p">' + attendeeName +'</h4></div><div class="col-md-1 margin-top-9p"><a class="text-h2 text-normal text-gray-hover" href="#" onclick="deleteAttendee(attendee'+ i + ');return false;"><i class="fa fa-times fa-md"></i> </a></div></div>';

	document.getElementById('attendeeList').innerHTML += string;
	document.getElementById('nameHolder').value = '';
	document.getElementById('emailHolder').value = '';
	document.getElementById('nameHolder').focus();

};

function deleteAttendee(tabId){
	$(tabId).remove();
};
