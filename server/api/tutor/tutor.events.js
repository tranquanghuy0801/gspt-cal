/**
 * Tutor model events
 */

'use strict';

import {EventEmitter} from 'events';
var TutorEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
TutorEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Tutor) {
  for(var e in events) {
    let event = events[e];
    Tutor.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    TutorEvents.emit(event + ':' + doc._id, doc);
    TutorEvents.emit(event, doc);
  };
}

export {registerEvents};
export default TutorEvents;
