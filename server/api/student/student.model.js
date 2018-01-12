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
  fullName:{
    type: String,
    required: true
  },
  crmID: String,
  isActive:{
  	type: Boolean,
  	default: true
  },
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
  clientFirstName: String,
  clientLastName: String,
  clientEmail: String,
  clientPh: String,
  studentNotes: String,
  var3: Boolean,
  var4: Boolean,
  backupLink: {
  	type: mongoose.Schema.Types.ObjectId
  },
  dateCreated:{
    type: Date,
    default: Date.now()
  },
  dateModified: Date
});

StudentSchema
  .pre('save', function(next) {
    this.dateModified = Date.now();
    next();
  });

registerEvents(StudentSchema);
export default mongoose.model('Student', StudentSchema);
