 export default angular.module('inpressApp.roundUp', [])
  .filter('roundUp', function() {
    return function (value) {
            return Math.ceil(value);
        }
  }).name;