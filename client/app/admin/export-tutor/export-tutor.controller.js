'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter, JSONToCSVConvertor) {
    	this.$http = $http;
    	this.$filter = $filter;
    	this.search = {};
    	this.JSONToCSVConvertor = JSONToCSVConvertor;
  	}

  	$onInit(){
  		this.$http.get('/api/tutors')
	      .then(response => {
	      	this.tutors = response.data
	    });

      this.$http.get('/api/lessons')
      	.then(response => {
      		this.lessons = response.data
      	})

      	this.$http.get('/api/students')
      		.then(response => {
      			this.students = response.data
      		})
  	}

  	export(data){
		data = data.map( entity => {
			var newObj = {};
			if(entity.student){
				newObj.clientName = entity.student.firstName + ' ' + entity.student.lastName
			} else {
				newObj.clientName = 'Hidden User'
			}

      newObj.time = entity.totalTime

      return newObj
			
		})

    data.push({clientName: 'Total Time', time: this.totalTime})

   
		this.JSONToCSVConvertor(data, 'Tutor Export ' + this.search.tutor[0].fullName, true);
	}

	returnFilter(results, $query){
        return results.filter(function(item){
          return item.fullName.toLowerCase().indexOf($query.toLowerCase()) != -1;
        })
    }

	submit(){
		var {start, end, tutor} = this.search;            

  		if(!start || !end || !tutor.length){
  			return;
  		}

     	tutor = tutor[0]
     	var temp;
		temp = this.lessons.filter(entity => entity.tutorUID === tutor._id);
		temp = temp.map(entity => this.timeCompress(entity, start, end))

		var temper2 = [];

    temp.forEach(lesson => {
			var foundEr = false;
			temper2.some(found => {
				if(found.clientUID === lesson.clientUID){

	            found.totalTime += lesson.totalTime
					foundEr = true;
					return true;
				}
				
			})

			if(foundEr === false){
				temper2.push(lesson)
			}
		})

    temper2 = temper2.map(ent => {
      ent.totalTime /= 60
      return ent
    })
    temper2 = temper2.filter(ent => ent.totalTime !== 0)
    temper2 = temper2.sort((a,b) =>  {
      if(a.student.firstName < b.student.firstName) return -1;
      if(a.student.firstName > b.student.firstName) return 1;
      return 0;
    });

    this.totalTime = 0;

    temper2.forEach(ent => {
      this.totalTime += ent.totalTime
    })

  	this.less = temper2

	}

	timeCompress(lesson, start, end){
		var msDay = 1000 * 60 * 60 * 24

  		this.students.forEach(student =>{
  			if(lesson.clientUID == student._id)
  				lesson.student = student;
  		});

  		lesson.newDate = this.$filter('reparseDate')(lesson.date)
  		lesson.totalTime = 0;
      end.setDate(end.getDate() + 1);

  		if(lesson.newDate > end){
  			return lesson
  		}

  		var maxPossible = Math.floor((end.getTime() - lesson.newDate.getTime())/msDay/lesson.frequency) + 1;

  		if(lesson.instances !== 0 && (lesson.instances < maxPossible)){
  			maxPossible = lesson.instances;
  		}

  		var startIndex = 0;
  		if(start > lesson.newDate){
  			var dif = (start.getTime() - lesson.newDate.getTime())/msDay;
  			startIndex = Math.ceil(dif/lesson.frequency)
  		}

  		for(var i = startIndex; i < maxPossible; i++){
  			if(lesson.overwriteVisibility && lesson.overwriteVisibility[i] === true){
  				continue;
  			}

  			if(lesson.overwriteColor && lesson.overwriteColor[i]){
  				if(lesson.overwriteColor[i].includes('red')){
  					continue;
  				}
  			} else {
  				if(lesson.color.includes('red')){
  					continue;
  				}
  			}

  			if(lesson.overwriteDuration && lesson.overwriteDuration[i]){
  				//if overwrite exists and it's the colour we're looking for
  				//add a found
          		lesson.totalTime += lesson.overwriteDuration[i]
  			} else {
  				//if no overwrite is found and default color is the colour
  				//we're after then we're all sweet
          		lesson.totalTime += lesson.duration
  			}

  		}

  		return lesson;
	}
}