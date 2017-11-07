'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './lesson.events';

var LessonSchema = new mongoose.Schema({
  clientUID: {
  	type: mongoose.Schema.Types.ObjectId,
  	required: true
  },
  tutorUID:{
	type: mongoose.Schema.Types.ObjectId,
	required: true
  },
  globalNotes: {
  	type: String,
  	maxLength: 5000
  },
  startTime:{
  	type: Number,
  	min: 0,
  	max: 2400,
  	required: true
  },
  duration:{
  	type: Number,
  	min: 0,
  	max: 2400,
  	required: true
  },
  room:{
  	type: Number,
  	min: 0,
  	required: true
  },
  isHidden:{
  	type: Boolean,
  	default: false
  },
  date:{
  	type: Date,
  	required: true
  },
  isRecurring:{
  	type: Boolean,
  	default: true
  },
  endDate:{
  	type: Date,
  	required() {
  		return this.isRecurring;
    }
  },
  frequency:{
  	type: Number,
  	default: 7
  },
  color:{
  	type: String,
  	lowercase: true,
  	default: 'grey'
  },
  overwriteColor: {
    type: mongoose.Schema.Types.Mixed
  },
  overwriteVisibility: {
    type: mongoose.Schema.Types.Mixed
  },
  overwriteStart: {
    type: mongoose.Schema.Types.Mixed
  },
  overwriteRoom:{
    type: mongoose.Schema.Types.Mixed
  },
  addText: {
    type: mongoose.Schema.Types.Mixed
  },
  dateCreated:{
    type: Date,
    default: Date.now()
  },
  dateModified: Date
});

LessonSchema
  .pre('save', function(next) {
    this.dateModified = Date.now();
    next();
  });

registerEvents(LessonSchema);
export default mongoose.model('Lesson', LessonSchema);
