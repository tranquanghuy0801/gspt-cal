'use strict';

export default class {
  /*@ngInject*/
  constructor($http, $filter, ColorFinder) {
    this.$http = $http;
    this.$filter = $filter;
    this.ColorFinder = ColorFinder;
    this.total = 0;
  }


  $onInit() {
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

  returnFilter(results, $query) {
    return results.filter(function(item) {
      return item.fullName.toLowerCase().indexOf($query.toLowerCase()) != -1;
    })
  }

  processFound(found) {
    var text = '';

    for (var key in found) {
      text += key + ': ';
      text += found[key] + ', '
    }

    return text;
  }

  processLessons() {
    var { start, end, student } = this.search;

    student = student[0] // needed as it's a tag search
    var temper = this.lessons.filter(lesson => !lesson.isHidden);
    temper = temper.filter(lesson => student._id === lesson.clientUID);
    temper = temper.map(lesson => this.colourInstances(lesson, start, end))

    console.log(temper);

    //merge together now

    var counts = []; //this will be [[color, count], [color, count]] etc...

    temper.forEach(lesson => {

      const lessonCount = lesson.found;

      if(!lessonCount){
        return;
      }

      for(var key in lessonCount){
        if(key.includes('red')){
          continue; //remove any red colours
        }
        const countIndex = counts.findIndex(count => count[0] === key);

        if(countIndex === -1){
          counts.push([key, lessonCount[key]]);
        } else {
          counts[countIndex][1] += lessonCount[key];
        }
      }
    });

    this.counts = counts;

    //find total
    this.total = 0;
    this.counts.forEach(count => {
      this.total += count[1];
    });
  }

  //don't count red

  colourInstances(lesson, start, end) {
    //attaches number of colour instances between the dates.
    var msDay = 1000 * 60 * 60 * 24

    lesson.newDate = this.$filter('reparseDate')(lesson.date)
    lesson.found = {};

    if (lesson.newDate > end) {
      return lesson
    }

    var maxPossible = Math.floor((end.getTime() - lesson.newDate.getTime()) / msDay / lesson.frequency) + 1;

    if (lesson.instances !== 0 && (lesson.instances < maxPossible)) {
      maxPossible = lesson.instances;
    }

    var startIndex = 0;
    if (start > lesson.newDate) {
      var dif = (start.getTime() - lesson.newDate.getTime()) / msDay;
      startIndex = Math.ceil(dif / lesson.frequency)
    }

    for (var i = startIndex; i < maxPossible; i++) {
      if (lesson.overwriteVisibility && lesson.overwriteVisibility[i] === true) {
        continue;
      }

      var fonCol = this.ColorFinder(lesson, i);

      if (lesson.found[fonCol]) {
        lesson.found[fonCol] += 1;
      } else {
        lesson.found[fonCol] = 1;
      }

      console.log(lesson.found)

    }

    return lesson;
  }
}
