/**
 * Student model events
 */

'use strict';

import {EventEmitter} from 'events';
var StudentEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
StudentEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Student) {
  for(var e in events) {
    let event = events[e];
    Student.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    StudentEvents.emit(event + ':' + doc._id, doc);
    StudentEvents.emit(event, doc);
  };
}

export {registerEvents};
export default StudentEvents;
