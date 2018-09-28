const mongoose = require('mongoose');
const { Schema } = mongoose;

const Pin = new Schema({
  caption: String,
  url: String,
  ownerId: String,
  ownerName: String,
  likes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Pin', Pin);
