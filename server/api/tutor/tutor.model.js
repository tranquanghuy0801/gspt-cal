'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './tutor.events';

var TutorSchema = new mongoose.Schema({
  firstName:{
  	type: String,
  	required: true
  },
  lastName:{
  	type: String,
  	required: true
  },
  isActive:{
  	type: Boolean,
  	default: true
  },
  phone: String,
  backupLink:{
  	type: mongoose.Schema.Types.ObjectId
  },
  dateCreated:{
    type: Date,
    default: Date.now()
  },
  dateModified: Date
});

TutorSchema
  .pre('save', function(next) {
    this.dateModified = Date.now();
    next();
  });

registerEvents(TutorSchema);
export default mongoose.model('Tutor', TutorSchema);
