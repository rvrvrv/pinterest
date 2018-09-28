const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = new Schema({
  id: String,
  name: String,
  img: String,
  pins: [String],
  likes: [{
    url: String,
    ownerId: String
  }]
});

module.exports = mongoose.model('User', User);
