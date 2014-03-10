//FUNCTIONS FOR ADDING AGENDA ITEMS


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
	$('<div id="agendaItem'+ i + '">'+
		'<div class="row">'+
		'<div class="col-md-1 margin-top-1p padding-bottom-2p margin-0 padding-0">'+
    		'<div class="height-100p width-100p">'+
      			'<div class="progress progress-striped progress-vertical-circle-bigger progress-striped active progress-success margin-top-n1x margin-bottom-0p">'+
        			'<div style="width:40px" class="bar"></div>'+
      					'</div></div></div>'+
		'<div class="col-md-7 margin-0 padding-0">'+
    		'<input id="makeMeeting'+i+'" type="text" name="agendaTopic" placeholder="ADD AGENDA ITEM" autocomplete="off" class="text-h3 height-30x form-control border-square border-none text-left bg-transparent"/>'+
  				'</div>'+
  		'<div class="col-md-3">'+
  				'<input id="makeMeeting'+i+'" type="text" name="duration" class=" text-h3 height-30x form-control border-square border-none text-right bg-transparent" placeholder= "TIME" autocomplete="off"/>'+
  				'</div>'+
  		'<div class="col-md-1 padding-0 text-center" style="margin-top:0.5%;">'+
  			'<a class="text-h2 text-normal" href="#" onclick="removeAgenda(agendaItem'+ i + ');return false;">X</a>'+
  			'</div></div>'+
	'<div class="row">'+
  		'<div class="col-md-1 margin-top-1p padding-bottom-2p margin-0 padding-0">'+
    		'<div class="height-100p width-100p">'+
    			'<div class="progress progress-striped progress-vertical-line-shorter progress-striped active progress-success margin-top-n1x margin-bottom-0p">'+
       				'<div style="width:40px" class="bar">'+
       				'</div></div></div></div>'+
  		'<div class="col-md-11 margin-0 padding-0">'+
    		'<div class="width-95p margin-top-1p overflow-scroll-y-auto max-height-120x">'+
     			'<input id="makeMeeting'+i+'" type="text" name="notes" placeholder="INSERT NOTES HERE" autocomplete="off" class="text-h4 height-30x form-control border-square border-none text-left bg-transparent"/>'+
     			'</div></div></div></div>').appendTo(agendaBox);
	i++;
};

//FUNCTION: REMOVE AGENDA FIELDS GIVEN INPUT
function removeAgenda(tabId){
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
