'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: Number,
    name: String,
    img: String,
    pins: [ String ],
    likes: [{
        src: String,
        ownerId: Number
    }]
});

module.exports = mongoose.model('User', User);