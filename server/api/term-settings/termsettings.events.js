/**
 * Term model events
 */

'use strict';

import {EventEmitter} from 'events';
var TermEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
TermEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Term) {
  for(var e in events) {
    let event = events[e];
    Term.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    TermEvents.emit(event + ':' + doc._id, doc);
    TermEvents.emit(event, doc);
  };
}

export {registerEvents};
export default TermEvents;
