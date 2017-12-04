'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './icon.events';

var IconSchema = new mongoose.Schema({
  first: {
  	type: String,
  	required: true,
  	lowercase: true
  },
  second: {
  	type: String,
  	required: true,
  	lowercase: true
  },
  third: {
  	type: String,
  	required: true,
  	lowercase: true
  },
  year12: {
  	type: String,
  	required: true,
  	lowercase: true
  }
});

registerEvents(IconSchema);
export default mongoose.model('Icon', IconSchema);
