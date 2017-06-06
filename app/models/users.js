'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: Number,
    name: String,
    img: String,
    pins: [ String ]
});

module.exports = mongoose.model('User', User);