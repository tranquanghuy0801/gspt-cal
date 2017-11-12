'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://admin:adminpassword@ds147421.mlab.com:47421/calendar'
  },

  // Seed database on startup
  seedDB: true

};
