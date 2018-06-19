'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter, JSONToCSVConvertor, HourFinder, ColorFinder, ValidIndexes) {
    	this.$http = $http;
    	this.$filter = $filter;
    	this.search = {};
    	this.JSONToCSVConvertor = JSONToCSVConvertor;
      this.HourFinder = HourFinder;
      this.ColorFinder = ColorFinder;
      this.ValidIndexes = ValidIndexes;
  	}

  $onInit(){
    this.$http.get('/api/tutors')
    .then(response => {
      this.tutors = response.data;
    });

    this.$http.get('/api/lessons')
    .then(response => {
      this.lessons = response.data;
    })

    this.$http.get('/api/students')
    .then(response => {
      this.students = response.data;
    })
  }

  export(data){
		data = data.map( entity => {
			var newObj = {};
			if(entity.student){
				newObj.clientName = entity.student.firstName + ' ' + entity.student.lastName;
			} else {
				newObj.clientName = 'Hidden User';
			}

      newObj.time = entity.totalTime;

      return newObj;			
		})

    data.push({clientName: 'Total Time', time: this.totalTime});

   
		this.JSONToCSVConvertor(data, 'Tutor Export ' + this.search.tutor[0].fullName, true);
	}

	returnFilter(results, $query){
    return results.filter(function(item){
      return item.fullName.toLowerCase().indexOf($query.toLowerCase()) != -1;
    })
  }

	submit(){
    const msDay = 1000 * 60 * 60 * 24;
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
			var found = temper2.some(found => {
				if(found.clientUID === lesson.clientUID){
          found.totalTime += lesson.totalTime
					return true;
				}
				
			})

			if(found === false){
				temper2.push(lesson)
			}
		})

    temper2 = temper2.map(ent => {
      ent.totalTime /= 60; //convert mins to hours
      return ent;
    });

    temper2 = temper2.filter(ent => ent.totalTime !== 0);

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
		lesson.student = this.students.find(student => lesson.clientUID == student._id);
    lesson.totalTime = 0;

		const validIndexes = this.ValidIndexes(lesson, start, end);

    validIndexes.forEach(index => {
      const effectiveColor = this.ColorFinder(lesson, index); //effective being the actual colour of the sessions
      if(effectiveColor.includes('red') || effectiveColor.includes('grey') || effectiveColor.includes('yellow')){
        return;
      };

      const effectiveDuration = this.HourFinder(lesson, index);
      lesson.totalTime += effectiveDuration;
    })

		return lesson;
	}
}