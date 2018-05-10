const mongoose = require("mongoose");
const moment = require("moment");

const ClienteSchema = new mongoose.Schema(
    {
        nome: { type: String, required: true, max: 100, trim: true, uppercase: true },
        cognome: { type: String, required: true, max: 100, trim: true, uppercase: true },
        data_di_nascita: { type: Date },
        luogo_di_nascita: { type: String, required: true, max: 100, trim: true, uppercase: true },
    }
);

//VIRTUALS
ClienteSchema
    .virtual('nome_completo')
    .get(function () {
        return this.cognome + ' ' + this.nome;
    });

ClienteSchema
    .virtual('url')
    .get(function () {
        return '/clienti/' + this._id;
    });

ClienteSchema
    .virtual('data_di_nascita_formattata')
    .get(function () {
        return this.data_di_nascita ? moment(this.data_di_nascita).format('DD-MM-YYYY') : '';
    });

ClienteSchema
    .virtual('data_di_nascita_yyyy_mm_dd')
    .get(function () {
        return moment(this.data_di_nascita).format('YYYY-MM-DD');
    });

module.exports = mongoose.model('Cliente', ClienteSchema);