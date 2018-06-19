export default function() {
  	//expects an array
  	//purpose is to start an array at 'start'
  	return function(value) {
		if(value instanceof Date){
			var result = value;
		} else {
			var result = new Date(value);
		}

		var dd = result.getDate();
		var mm = result.getMonth() + 1; //January is 0
		var yyyy = result.getFullYear();

		if(dd < 10){
		    dd = dd;
		} 
		if(mm < 10){
		    mm = mm;
		} 

		return dd + '/' + mm + '/' + yyyy;
	}
}