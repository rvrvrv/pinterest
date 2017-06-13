'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pin = new Schema({
    caption: String,
    src: String,
    ownerId: String,
    ownerName: String,
    likes: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Pin', Pin);
