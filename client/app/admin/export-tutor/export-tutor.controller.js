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
      this.results = []; // [{}, {}]
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
      return {
        clientName: entity.student.fullName,
        time: entity.totalTime,
      };			
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
    this.results = [];
    const msDay = 1000 * 60 * 60 * 24;
		var {start, end, tutor} = this.search;  

		if(!start || !end || !tutor.length){
			return;
		}

   	tutor = tutor[0]

   	const tutorsLessons = this.lessons.filter(entity => entity.tutorUID === tutor._id);
		tutorsLessons.forEach(entity => this.timeCompress(entity, start, end));

    this.results = this.results.sort((a,b) =>  {
      if(a.student.fullName < b.student.fullName) return -1;
      if(a.student.fullName > b.student.fullName) return 1;
      return 0;
    });

    this.totalTime = 0;

    this.results.forEach(ent => {
      this.totalTime += ent.totalTime
    })

  	this.less = this.results;
	}

	timeCompress(lesson, start, end){
		lesson.student = this.students.find(student => lesson.clientUID == student._id);

		const validIndexes = this.ValidIndexes(lesson, start, end);

    validIndexes.forEach(index => {
      const effectiveColor = this.ColorFinder(lesson, index); //effective being the actual colour of the sessions
      if(effectiveColor.includes('red') || effectiveColor.includes('grey') || effectiveColor.includes('yellow')){
        return;
      };

      console.log(lesson, index, effectiveColor);

      var student = {
        first: lesson.student.firstName,
        last: lesson.student.lastName,
        fullName: lesson.student.fullName,
      };

      if(lesson.overwriteName && lesson.overwriteName[index]){
        student.first = lesson.overwriteName[index];
        student.last = null;
        student.fullName =  lesson.overwriteName[index] + ' - Overwritten Name';
      }
      
      this.addToResults({
        student,
        totalTime: this.HourFinder(lesson, index)/60,
      });
    })
	}

  addToResults(data){
    const foundIndex = this.results.findIndex(result => result.student.fullName === data.student.fullName);

    if(foundIndex === -1){
      return this.results.push(data);
    }

    this.results[foundIndex].totalTime += data.totalTime;
  }
}