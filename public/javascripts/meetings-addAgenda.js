//FUNCTIONS FOR ADDING AGENDA ITEMS

//FUNCTION:AUTOMATICALLY ADD AGENDA FIELD IF CLICKED
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
	$('<div class="row padding-top-2p agendaItems" id="agendaItem'+ i + '"><div class="col-md-6 col-sm-6 col-xs-6 col-md-offset-2"> <input class="form-control border-square border-none text-left text-h5 text-black bg-grayblue border-grayblue" id="addMeetingItem", type="text", name="agendaTopic", placeholder="INSERT AGENDA ITEM", onkeypress="addAgendaItemKeypress()"></div><div class="col-md-2 col-sm-2 col-xs-2 text-right red-input"><input id="addMeeting" type="text" name="duration" placeholder="TIME(HH:MM)" class="form-control border-square border-none text-left text-h5 text-red bg-grayblue border-grayblue"/></div><a href="#" onclick="removeAgenda(agendaItem'+ i + ');return false;">X</a></div>').appendTo(agendaBox);
	i++;
};

//FUNCTION: REMOVE AGENDA FIELDS GIVEN INPUT
function removeAgenda(tabId){
        $(tabId).remove();
};
