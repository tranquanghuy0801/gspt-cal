'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter) {
    	this.$http = $http;
    	this.$filter = $filter;
  	}

  	
  	$onInit(){
  		this.search = {
  			
  		};
  		this.$http.get('/api/lessons/')
  			.then(res => {
  				this.lessons = res.data;
  			})

  		this.$http.get('/api/students')
	      .then(response => {
	      	this.students = response.data.filter(student => student.isActive)
	    });
  	}

    returnFilter(results, $query){
        return results.filter(function(item){
          return item.fullName.toLowerCase().indexOf($query.toLowerCase()) != -1;
        })
    }

  	processLessons(){
  		var {start, end, student} = this.search;            

  		if(!start || !end || !student.length){
  			return;
  		}

  		var temper;
      student = student[0]
  		temper = this.lessons.filter(lesson => !lesson.isHidden);
      temper = temper.filter(lesson => student._id === lesson.clientUID);
  		temper = temper.map(lesson => this.colourInstances(lesson, start, end))

      console.log(temper);
  		//merge together now

  		var temper2 = [];

  		temper.forEach(lesson => {
  			var foundEr = false;
  			temper2.some((found, index) => {
  				if(found.clientUID === lesson.clientUID){

            for(var i in temper2[index].found){
              if(lesson.found[i]){
                temper2[index].found[i] += lesson.found[i]
              }
              
            }

            for(var i in lesson.found){
              if(!temper2[index].found[i]){
                temper2[index].found[i] = lesson.found[i]
              }
            }
  					foundEr = true;
  					return true;
  				}
  				
  			})
  			if(foundEr === false){
  				temper2.push(lesson)
  			}
  		})

      temper.forEach(entity => {
        entity.total = 0;

        for(var i in entity.found){
          if(!i.includes('red')){
            entity.total += entity.found[i]
          }
        }

      })

  		this.less = temper2
  	}

//don't count red

  	colourInstances(lesson, start, end){
  		//attaches number of colour instances between the dates.
  		var msDay = 1000 * 60 * 60 * 24

  		this.students.forEach(student =>{
  			if(lesson.clientUID == student._id)
  				lesson.student = student;
  		});

  		lesson.newDate = this.$filter('reparseDate')(lesson.date)
  		lesson.found = {};

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
  				//if overwrite exists and it's the colour we're looking for
  				//add a found
          var fonCol = lesson.overwriteColor[i]
  			} else {
  				//if no overwrite is found and default color is the colour
  				//we're after then we're all sweet
          var fonCol = lesson.color
  			}



        if(lesson.found[fonCol]){
          lesson.found[fonCol] += 1;
        } else {
          lesson.found[fonCol] = 1;
        }

        console.log(lesson.found)

  		}

  		return lesson;
  	}
 }