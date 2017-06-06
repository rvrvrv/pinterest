'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pin = new Schema({
	title: String,
	src: String,
    owner: String,
    likes: Number,
    copies: Number
});

module.exports = mongoose.model('Pin', Pin);

