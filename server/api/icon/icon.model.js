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
  fourth: {
    type: String,
    required: true,
    lowercase: true
  },
  fifth: {
    type: String,
    required: true,
    lowercase: true
  },
  sixth: {
    type: String,
    required: true,
    lowercase: true
  },
  year12: {
  	type: String,
  	required: true,
  	lowercase: true
  },
  __v: { 
      type: Number, 
      select: false,
  },
});

registerEvents(IconSchema);
export default mongoose.model('Icon', IconSchema);
