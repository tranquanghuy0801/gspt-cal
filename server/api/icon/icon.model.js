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
  _note:{
    type: String,
  	required: true,
  	lowercase: true
  },
  _tempUnknown:{
    type: String,
  	required: true,
  	lowercase: true
  },
  _permUnknown:{
    type: String,
  	required: true,
  	lowercase: true
  },
  _perm2Unknown:{
    type: String,
  	required: true,
  	lowercase: true
  },
  _sixty:{
    type: String,
  	required: true,
  	lowercase: true
  },
  _seventy:{
    type: String,
  	required: true,
  	lowercase: true
  },
  _eighty:{
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
