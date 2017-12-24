'use strict';
/*eslint no-process-env:0*/

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP
    || process.env.ip
    || undefined,

  // Server port
  port: 80,

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://admin:adminpassword@ds147421.mlab.com:47421/calendar'
  }
};
