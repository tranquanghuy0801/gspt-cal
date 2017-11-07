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
      this.$http.post('/api/tutors', newTutor);
      this.grab();
    }
  }

  patchTutor(tutor){
    if(tutor) {
      this.$http.put('/api/tutors/' + String(tutor._id), tutor);
      this.grab();
    }
  }

  openModal(tutor){
    this.Modal.editTutor(tutor);
  }
}
