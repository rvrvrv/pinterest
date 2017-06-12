'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pin = new Schema({
	caption: String,
	src: String,
    ownerId: Number,
    ownerName: String,
    likes: Number
});

module.exports = mongoose.model('Pin', Pin);

