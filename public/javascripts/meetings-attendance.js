//FUNCTIONS FOR PROGRESS BAR DURING MEETING
$(document).ready(function(){
});

function changeAttendance(ID){
	var current=document.getElementById(ID).innerHTML;
	var IDElement='#'+ID;
	if(current=='ABSENT'){
		document.getElementById(ID).innerHTML='PRESENT';
		$(IDElement).removeClass('text-orange-blue-hover');
		$(IDElement).addClass('text-light-blue-nohover');

	}else{
		document.getElementById(ID).innerHTML='ABSENT';
		$(IDElement).removeClass('text-light-blue-nohover');
		$(IDElement).addClass('text-orange-blue-hover');
	}

}