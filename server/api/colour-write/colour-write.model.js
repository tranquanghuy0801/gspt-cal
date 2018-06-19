'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './colour-write.events';

var ColourWriteSchema = new mongoose.Schema({
  data: {
  	type: mongoose.Schema.Types.Mixed
  },
  calendarDate: {
  	type: Date,
  	required: true,
  },
  dateCreated: {
  	type: Date,
  	default: Date.now,
  },
});

registerEvents(ColourWriteSchema);
export default mongoose.model('ColourWrite', ColourWriteSchema);
