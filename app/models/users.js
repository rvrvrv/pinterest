'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: String,
    name: String,
    img: String,
    pins: [ String ],
    likes: [{
        src: String,
        ownerId: String
    }]
});

module.exports = mongoose.model('User', User);