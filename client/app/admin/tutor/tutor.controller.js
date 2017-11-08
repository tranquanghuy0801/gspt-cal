'use strict';

export default class TutorController {
  

  /*@ngInject*/
  constructor($http, $scope, Modal) {
    this.$http = $http;
    this.Modal = Modal;
  }

  $onInit() {
    this.grab();
  }

  grab(){
    this.$http.get('/api/tutors')
      .then(response => {
        this.tutors = response.data;
      });
  }

  addTutor(newTutor) {
    if(newTutor) {
      newTutor.fullName = newTutor.firstName + ' ' + newTutor.lastName;
      this.$http.post('/api/tutors', newTutor)
      .then(res => {
        this.grab();
        this.error = '';
      })
      .catch(res => {
        this.error = JSON.stringify(res.data, null, '\t');
      });
    }
  }

  patchTutor(tutor, callback){
    if(tutor) {
      tutor.fullName = tutor.firstName + ' ' + tutor.lastName;
      this.$http.put('/api/tutors/' + String(tutor._id), tutor)
        .then(res => {
          this.grab();
          this.error = '';
          callback();
        })
        .catch(res => {
          this.error = JSON.stringify(res.data, null, '\t');
        });
    }
  }

  openModal(tutor){
    this.Modal.editTutor(tutor);
  }
}
