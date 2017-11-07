export default angular.module('inpressApp.startFrom', [])
  .filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        try{
			return input.slice(start);
        }catch(err){
        	return [];
        }
        
    } 
  }).name;