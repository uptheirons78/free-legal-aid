const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GiudiceSchema = new Schema(
    {
        nome: { type: String, required: true, min: 3, max: 100, trim: true, uppercase: true }
    }
);

// Virtual for bookinstance's URL
GiudiceSchema
    .virtual('url')
    .get(function () {
        return '/giudici/' + this._id;
    });

//Export model
module.exports = mongoose.model('Giudice', GiudiceSchema);