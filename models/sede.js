const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SedeSchema = new Schema(
    {
        nome: { type: String, required: true, min: 3, max: 100, trim: true, uppercase: true }
    }
);

// Virtual for bookinstance's URL
SedeSchema
    .virtual('url')
    .get(function () {
        return '/sede/' + this._id;
    });

//Export model
module.exports = mongoose.model('Sede', SedeSchema);