'use strict';

export default class {
  /*@ngInject*/
  constructor($http, $filter, JSONToCSVConvertor, ColorFinder, HourFinder) {
    this.$http = $http;
    this.$filter = $filter;
    this.JSONToCSVConvertor = JSONToCSVConvertor;
    this.ColorFinder = ColorFinder;
    this.HourFinder = HourFinder;
    this.total = 0;
  }


  $onInit() {
    this.search = {
      colour: 'Dark Orange'
    };
    this.colours = ['Blue', 'Dark Blue', 'Striped Blue',
      'Orange', 'Dark Orange', 'Striped Orange',
      'Red', 'Dark Red', 'Striped Red',
      'Purple', 'Dark Purple', 'Striped Purple',
      'Grey', 'Dark Grey', 'Striped Grey',
      'Green', 'Dark Green', 'Striped Green',
      'Yellow', 'Dark Yellow', 'Striped Yellow'
    ];
    this.$http.get('/api/lessons/')
      .then(res => {
        this.lessons = res.data;
      })

    this.$http.get('/api/students')
      .then(response => {
        this.students = response.data.filter(student => student.isActive)
      });
  }

  export (data) {
    data = data.map(entity => {
      var newObj = {};
      if (entity.student) {
        newObj.clientName = entity.student.firstName + ' ' + entity.student.lastName
      } else {
        newObj.clientName = 'Hidden User'
      }
      newObj.found = entity.found;
      return newObj
    })
    this.JSONToCSVConvertor(data, 'Tutor Export - ' + this.search.colour, true);
  }

  processLessons() {
    var { colour, start, end } = this.search;

    var temper = this.lessons.filter(lesson => !lesson.isHidden);
    temper = temper.map(lesson => this.colourInstances(lesson, colour, start, end))

    //merge together now

    var temper2 = [];

    temper.forEach(lesson => {
      var foundEr = false;
      temper2.some((found, index) => {
        if (found.clientUID === lesson.clientUID) {
          temper2[index].found += lesson.found
          foundEr = true;
          return true;
        }

      })
      if (foundEr === false) {
        temper2.push(lesson)
      }
    })

    this.less = temper2.sort((a, b) => a.found - b.found);

    this.total = 0;
    this.less.forEach(lesson => {
      this.total += lesson.found;
    })
  }

  colourInstances(lesson, colour, start, end) {
    //attaches number of colour instances between the dates.
    var msDay = 1000 * 60 * 60 * 24
    colour = colour.toLowerCase();

    console.log(colour)

    this.students.forEach(student => {
      if (lesson.clientUID == student._id)
        lesson.student = student;
    });

    lesson.newDate = this.$filter('reparseDate')(lesson.date)
    lesson.found = 0;

    if (lesson.newDate > end) {
      return lesson
    }

    var maxPossible = Math.floor((end.getTime() - lesson.newDate.getTime()) / msDay / lesson.frequency) + 1;

    console.log(lesson.newDate, 'newDate');
    console.log('max', maxPossible)

    if (lesson.instances !== 0 && (lesson.instances < maxPossible)) {
      maxPossible = lesson.instances;
    }

    var startIndex = 0;
    if (start > lesson.newDate) {
      var dif = (start.getTime() - lesson.newDate.getTime()) / msDay;
      startIndex = Math.ceil(dif / lesson.frequency)
    }

    console.log(startIndex, 'start', maxPossible)

    for (var i = startIndex; i < maxPossible; i++) {
      if (lesson.overwriteVisibility && lesson.overwriteVisibility[i] === true) {
        continue;
      }

      var lessonColor = this.ColorFinder(lesson, i);
      if (lessonColor === colour) {
        //if the colour matches then increment found
        lesson.found += 1;
      }

    }

    console.log(maxPossible, startIndex)

    return lesson;
  }
}
