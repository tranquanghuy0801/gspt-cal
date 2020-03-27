'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './lesson.events';

var LessonSchema = new mongoose.Schema({
    clientUID: {
        type: String,
        required: true
    },
    tutorUID:{
        type: String,
        required: true
    },
    globalNotes: {
        type: String, 
        maxLength: 5000
    },
    startTime:{
        type: Number,
        min: 0,
        max: 2400, //likely should be 1440 instead
        required: true
    },
    duration:{
        type: Number,
        min: 0,
        max: 2400, //likely should be 1440 instead
        required: true
    },
    location:{
        type: String,
        required: true
    },
    room:{ // zero based rooms
        type: Number,
        min: 0,
        required: true,
        lowercase: true
    },
    isHidden:{
        type: Boolean,
        default: false
        //hide throughout all of the cal
    },
    date:{ //starting date
        type: String, //dd/mm/yyyy
        required: true
    },
    instances:{
        type: Number,
        default: 0
        //0 means it's inf
        //1 is a one off
    },
    frequency:{
        type: Number,
        default: 7
    },
    color:{
        type: String,
        lowercase: true,
        default: 'blue'
    },
    changeover: {
        type: Boolean,
        default: false,
    },
    overwriteChangeover: {
        type: mongoose.Schema.Types.Mixed,
    },
    overwriteColor: {
        type: mongoose.Schema.Types.Mixed
    },
    overwriteFromHere: {
        type: mongoose.Schema.Types.Mixed
    },
    overwriteVisibility: {
        type: mongoose.Schema.Types.Mixed
    },
    overwriteDuration: {
        //overwrite for time of day
        type: mongoose.Schema.Types.Mixed
    },
    overwriteStart: {
        //overwrite for time of day
        type: mongoose.Schema.Types.Mixed
    },
    overwriteRoom:{
        type: mongoose.Schema.Types.Mixed
    },
    overwriteNotes: {
        type: mongoose.Schema.Types.Mixed
    },
    overwriteVar1: {
        type: mongoose.Schema.Types.Mixed
    },
    overwriteVar2: {
        type: mongoose.Schema.Types.Mixed
    },
     overwriteVar5: {
        type: mongoose.Schema.Types.Mixed
    },
     overwriteVar6: {
        type: mongoose.Schema.Types.Mixed
    },
    overwriteVar7: {
        type: mongoose.Schema.Types.Mixed
    },
    overwriteName: {
        type: mongoose.Schema.Types.Mixed
    },
    dateCreated:{
        type: Date,
        default: Date.now,
    },
    dateModified: Date,
    __v: { 
        type: Number, 
        select: false,
    },
});

LessonSchema
.pre('save', function(next) {
    this.dateModified = Date.now();
    next();
});

registerEvents(LessonSchema);
export default mongoose.model('Lesson', LessonSchema);
