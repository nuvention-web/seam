//FUNCTIONS FOR ASSIGNING TASKS TO MEMBERS
$(document).ready(function(){

	//FUNCTION: ASSIGN TASK INTERFACE- HIGHLIGHT IMG & ADD VALUE ONCE SELECTED
	$('#memberList img').click(function() {
		var value = $(this).attr('value');
		var inputName = 'assigned' + $(this).attr('name')
		if($(this).css('border-radius')=='0px'){
			$(this).css('border-radius','1px');
			$(this).css("border","1px solid rgb(204,51,51)");
			$(this).css("filter",'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 0\'/></filter></svg>#grayscale")');
			$(this).css("-webkit-filter","grayscale(0%)");
			$('[id="' + inputName + '"]').val(value);
		}
		else{                  
			$(this).css('border-radius','0px');
			$(this).css("border","none");
			$(this).css("filter","url(filters.svg#grayscale)");
			$(this).css("filter","gray");
			$(this).css("-webkit-filter","grayscale(1);");
			$('[id="' + inputName + '"]').val('');
		}
	});
});

//FUNCTION: TOGGLES BETWEEN HIDDEN AND VISIBILE FOR GIVEN ID INPUT
function chooseVisibility(tabId){
	var value = $(this).attr('value');
	if($('#'+tabId+'-div').css('display')=='none')
	{ 
		$('#'+tabId+'-div.hidden-login').delay(300).fadeIn(300);
	}
	else{
		$('#'+tabId+'-div.hidden-login').delay(300).fadeOut(700);  
	}
};
