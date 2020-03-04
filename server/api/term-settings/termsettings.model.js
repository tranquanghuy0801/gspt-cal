'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './termsettings.events';

var TermSettingsSchema = new mongoose.Schema({
  termNo: {
  	type: Number,
  	required: true
  },
  startDate: {
  	type: String,
  	required: true
  },
  endDate: {
  	type: String,
  	required: true
  },
  sixthSunday: {
    type: String,
    required: true,
  },
  __v: { 
      type: Number, 
      select: false,
  },
});

registerEvents(TermSettingsSchema);
export default mongoose.model('TermSettings', TermSettingsSchema);
