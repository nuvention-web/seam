//FUNCTIONS FOR PROJECTS INTERFACE

//FUNCTION: TOGGLE VIEW FOR GIVEN ID INPUT
function toggleView(id) {
	 var e = document.getElementById(id);
	 if(e.style.display == 'inline')
			e.style.display = 'none';
	 else
			e.style.display = 'inline';
}