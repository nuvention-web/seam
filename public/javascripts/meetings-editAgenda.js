//FUNCTION: ADD NOTE TO MEETING INTERFACE
function editAgenda(elementId){
	document.getElementById(elementId).action = location.protocol + "//" + location.host + '/addnote';
	document.getElementById(elementId).submit();
	return true;
};

//FUNCTION: ADD TASK TO MEETING INTERFACE
function startAgenda(elementId){
	document.getElementById(elementId).action = location.protocol + "//" + location.host + '/dashboard/meetings/start';
	document.getElementById(elementId).submit();
	return true;
};

//FUNCTION: ADD TASK TO MEETING INTERFACE
function viewMinutes(elementId){
	document.getElementById(elementId).action = location.protocol + "//" + location.host + '/dashboard/meetings/view/past';
	document.getElementById(elementId).submit();
	return true;
};

