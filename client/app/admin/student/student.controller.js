'use strict';

export default class StudentController {


  /*@ngInject*/
  constructor($http, $scope, Modal, JSONToCSVConvertor) {
    this.$http = $http;
    this.Modal = Modal;
    this.JSONToCSVConvertor = JSONToCSVConvertor;
  }

  $onInit() {
    this.grab();

    this.$http.get('/api/students/active')
      .then(response => {
        this.actives = response.data;
      });

    this.$http.get('/api/icons')
      .then(response => {
        this.icons = response.data[0] || {
          first: '',
          second: '',
          third: '',
          fourth: '',
          year12: ''
        };
      });
  }

  export(data) {

    data = data.map(student => {
      return {
        'Full Name': student.firstName + ' ' + student.lastName,
        'First Name': student.firstName || ' ',
        'Last Name': student.lastName || ' ',
        'Client Full Name': student.clientFirstName + ' ' + student.clientLastName,
        'Client First Name': student.clientFirstName || ' ',
        'Client Last Name': student.clientLastName || ' ',
        'Email': student.clientEmail || ' ',
        'Phone': student.clientPh || ' ',
        'Grade': student.grade || ' ',
        'CRM ID': student.crmID || ' ',
        'Is Active': student.isActive || 'false',
        'Is Tertiary': student.isTertiary || 'false',
      };
    })


    this.JSONToCSVConvertor(data, 'Student Export', true);
  }


  grab() {
    this.$http.get('/api/students')
      .then(response => {
        this.students = response.data;
      });
  }

  mergeNames(student) {
    var name = student.firstName + ' ' + student.lastName;
    if (student.clientFirstName || student.clientLastName) {
      name += ' - ' + student.clientFirstName + ' ' + student.clientLastName;
    }
    return name;
  }

  addStudent(newStudent) {
    if (newStudent) {
      newStudent.fullName = this.mergeNames(newStudent);
      this.$http.post('/api/students', newStudent)
        .then(res => {
          this.grab();
          this.error = '';
        })
        .catch(res => {
          this.error = JSON.stringify(res.data, null, '\t');
        });

    }
  }

  patchStudent(student, callback) {
    if (student) {
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

  openModal(student) {
    this.Modal.editStudent(student);
  }
}
