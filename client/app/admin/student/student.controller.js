'use strict';

export default class StudentController {
  

  /*@ngInject*/
  constructor($http, $scope, Modal) {
    this.$http = $http;
    this.Modal = Modal;
  }

  $onInit() {
    this.grab();
  }

  grab(){
    this.$http.get('/api/students')
      .then(response => {
        this.students = response.data;
      });
  }

  addStudent(newStudent) {
    if(newStudent) {
      this.$http.post('/api/students', newStudent);
      this.grab();
    }
  }

  patchStudent(student){
    if(student) {
      this.$http.put('/api/students/' + String(student._id), student);
      this.grab();
    }
  }

  addYear(){
    if(confirm('Are you sure you want to add a year to all students?')){
      this.students.forEach(student => {
        //If student is not in uni
        if(!student.isTertiary){
          if(student.grade == 12){
            student.isTertiary = true;
            student.isActive = false;
          } else {
            student.grade++;
          }
          //now save student
          this.$http.put('/api/students/' + String(student._id), student);
        }
      })
      //Update results
      this.grab();
    }
  }

  openModal(student){
    this.Modal.editStudent(student);
  }
}
