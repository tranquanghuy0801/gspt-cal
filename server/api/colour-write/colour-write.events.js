/**
 * ColourWrite model events
 */

'use strict';

import {EventEmitter} from 'events';
var ColourWriteEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ColourWriteEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(ColourWrite) {
  for(var e in events) {
    let event = events[e];
    ColourWrite.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    ColourWriteEvents.emit(event + ':' + doc._id, doc);
    ColourWriteEvents.emit(event, doc);
  };
}

export {registerEvents};
export default ColourWriteEvents;
