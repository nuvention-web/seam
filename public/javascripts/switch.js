$(document).ready(function() {

	$('.switch_options').each(function(index) {

		//This object
		var obj = jQuery(this);

		var enb = obj.children('.switch_enable'); //cache first element, this is equal to OFF
		var dsb = obj.children('.switch_disable'); //cache first element, this is equal to ON
		var input = obj.children('input'); //cache the element where we must set the value
		var input_val = obj.children('input').val(); //cache the element where we must set the value

		/* Check selected */
		if( 0 == input_val ){
			dsb.addClass('selected');
		}
		else if( 1 == input_val ){
			enb.addClass('selected');
		}

		//Action on user's click(ON)
		enb.on('click', function(){
			$(dsb).removeClass('selected'); //remove "selected" from other elements in this object class(OFF)
			$(this).addClass('selected'); //add "selected" to the element which was just clicked in this object class(ON) 
			$(input).val(1).change(); //Finally change the value to 1
			//this is a task
			if($(input).val() ==  1){
				var info = $("textarea[id='notes" + index + "']").val();
				$("textarea[id='taskName" + index + "']").val(info);
				$("textarea[id='notes" + index + "']").val('');
				$('#taskEntry' + index).show();
				$("textarea[id='taskAssignee" + index + "']").focus();
				$('#noteEntry' + index).hide();
			}
			else{
				var info = $("textarea[id='taskName" + index + "']").val();
				$("textarea[id='notes" + index + "']").val(info);
				$("textarea[id='taskName" + index + "']").val('');
				$('#noteEntry' + index).hide();
				$('#taskEntry' + index).show();
				$("textarea[id='notes" + index + "']").focus();
			}
		});

		//Action on user's click(OFF)
		dsb.on('click', function(){
			$(enb).removeClass('selected'); //remove "selected" from other elements in this object class(ON)
			$(this).addClass('selected'); //add "selected" to the element which was just clicked in this object class(OFF) 
			$(input).val(0).change(); // //Finally change the value to 0
			//this is a note
			if($(input).val() ==  0){
				var info = $("textarea[id='taskName" + index + "']").val();
				$("textarea[id='notes" + index + "']").val(info);
				$("textarea[id='taskName" + index + "']").val('');
				$('#taskEntry' + index).hide();
				$('#noteEntry' + index).show();
				$("textarea[id='notes" + index + "']").focus();
			}
			else{
				var info = $("textarea[id='notes" + index + "']").val();
				$("textarea[id='taskName" + index + "']").val(info);
				$("textarea[id='notes" + index + "']").val('');
				$('#noteEntry' + index).show();
				$("textarea[id='taskAssignee" + index + "']").focus();
				$('#taskEntry' + index).hide();
			}
		});

	});

});