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
  port: global.isSandbox ? 8082 : 8081,

  sheets_app_port: 8083,

  // MongoDB connection options
  mongo: {
    uri: global.isSandbox ? 'mongodb://localhost/calendar-sandbox' : 'mongodb://localhost/calendar'
  }
};
