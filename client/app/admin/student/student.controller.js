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

  mergeNames(student){
    var name = student.firstName + ' ' + student.lastName;
    if(student.clientFirstName || student.clientLastName){
      name += ' - ' + student.clientFirstName + ' ' + student.clientLastName;
    }
    return name;
  }

  addStudent(newStudent) {
    if(newStudent) {
      newStudent.fullName = this.mergeNames(newStudent);
      this.$http.post('/api/students', newStudent)
      .then(res => {
        this.grab();
        this.error = '';
      })
      .catch(res => {
        console.log(res);
        this.error = JSON.stringify(res.data, null, '\t');
      });
      
    }
  }

  patchStudent(student, callback){
    if(student) {
      student.fullName = this.mergeNames(student);
      this.$http.put('/api/students/' + String(student._id), student)
        .then(res => {
          this.grab();
          this.error = '';
          callback();
        })
        .catch(res => {
          console.log(res);
          this.error = JSON.stringify(res.data, null, '\t');
        });
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
