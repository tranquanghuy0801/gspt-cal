export default function() {
  //expects an array
  //purpose is to start an array at 'start'
  return function(input, start) {
    start = +start; //parse to int
    try{
		  return input.slice(start);
    } catch(err){
      return []; //returns an array to prevent errors
    } 
  } 
};