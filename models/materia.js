const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MateriaSchema = new Schema(
    {
        nome: { type: String, required: true, min: 3, max: 100, trim: true, uppercase: true }
    }
);

// Virtual for bookinstance's URL
MateriaSchema
    .virtual('url')
    .get(function () {
        return '/materia/' + this._id;
    });

//Export model
module.exports = mongoose.model('Materia', MateriaSchema);