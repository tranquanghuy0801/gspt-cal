'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './student.events';

var StudentSchema = new mongoose.Schema({
  firstName: {
  	type: String,
  	required: true
  },
  lastName:{
  	type: String,
  	required: true
  },
  crmID: String,
  isActive:{
  	type: Boolean,
  	default: true
  },
  dob: String,
  grade:{
  	type: Number,
  	required() {
  		return !this.isTertiary;
    }
  },
  isTertiary:{
  	type: Boolean,
  	default: false
  },
  clientEmail: String,
  clientPh: String,
  studentNotes: String,
  backupLink: {
  	type: mongoose.Schema.Types.ObjectId
  }
});

registerEvents(StudentSchema);
export default mongoose.model('Student', StudentSchema);
