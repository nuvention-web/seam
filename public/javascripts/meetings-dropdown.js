$(document).ready(function() {
	for(var i=1; i<10; i++){
			$('#agendaItem'+i).each(function() {
				var tis = $(this);
				var state = false;
				var hiddenBox= tis.next('div');
				if(i>1)
					hiddenBox.hide().css('height','auto').slideUp();
		    tis.click(function() {
		      state = !state;
		      toggleID=tis.next('.answer');
		      toggleID.slideToggle(state);
		      hiddenBox.slideToggle(state);
		      tis.toggleClass('active',state);
		    });
		  });
	}
    
}); 