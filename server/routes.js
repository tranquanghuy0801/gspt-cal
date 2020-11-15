/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below
  app.use('/api/colour-writes', require('./api/colour-write'));
  app.use('/api/icons', require('./api/icon'));
  app.use('/api/lessons', require('./api/lesson'));
  app.use('/api/tutors', require('./api/tutor'));
  app.use('/api/students', require('./api/student'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/termsettings', require('./api/term-settings'));
  app.use('/api/sms', require('./api/sms'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
