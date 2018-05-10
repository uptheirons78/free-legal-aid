const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GenreSchema = new Schema(
  {
    name: { type: String, required: true, min: 3, max: 100 }
  }
);

// Virtual for bookinstance's URL
GenreSchema
.virtual('url')
.get(function () {
  return '/catalog/genre/' + this._id;
});

//Export model
module.exports = mongoose.model('Genre', GenreSchema);