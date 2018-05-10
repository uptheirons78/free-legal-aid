const mongoose = require('mongoose');
const moment = require("moment");

const Schema = mongoose.Schema;

const GratuitoSchema = new Schema(
    {
        fascicolo: { type: String, required: true, trim: true, uppercase: true },
        cliente: { type: Schema.ObjectId, ref: 'Cliente', required: true },
        materia: { type: Schema.ObjectId, ref: 'Materia', required: true },
        giudice: { type: Schema.ObjectId, ref: 'Giudice', required: true },
        sede: { type: Schema.ObjectId, ref: 'Sede', required: true },
        rg: { type: String, trim: true, uppercase: true },
        data_istanza: { type: Date, required: true},
        protocollo_istanza: { type: String, trim: true, uppercase: true },
        ammissione: { type: String, default: 'NON AMMESSO', trim: true, uppercase: true},
        data_ammissione: { type: Date },
        istanza_liquidazione: { type: String, default: 'NO', trim: true, uppercase: true },
        data_istanza_liquidazione: { type: Date },
        importo_istanza_liquidazione: { type: Number },
        decreto_liquidazione: { type: String, default: 'NO', trim: true, uppercase: true },
        data_decreto_liquidazione: { type: Date },
        importo_decreto_liquidazione: { type: Number },
        fatturazione: { type: String, default: 'NO', trim: true, uppercase: true },
        data_fattura: { type: Date },
        importo_fattura: { type: Number },
        pagamento: { type: String, default: 'NO', trim: true, uppercase: true },
        data_pagamento: { type: Date }
    }
);

GratuitoSchema
    .virtual('url')
    .get(function () {
        return '/gratuito/' + this._id;
    });

//Virtual per gli importi
GratuitoSchema
    .virtual('importo_fattura_formattato')
    .get(function () {
        if(this.importo_fattura==null) {
            return '-';
        }
        return '€ ' + this.importo_fattura;
    });

GratuitoSchema
    .virtual('importo_decreto_liquidazione_formattato')
    .get(function () {
        if(this.importo_decreto_liquidazione==null) {
            return '-';
        }
        return '€ ' + this.importo_decreto_liquidazione;
    });

GratuitoSchema
    .virtual('importo_istanza_liquidazione_formattato')
    .get(function () {
        if(this.importo_istanza_liquidazione==null) {
            return '-';
        }
        return '€ ' + this.importo_istanza_liquidazione;
    });

GratuitoSchema
    .virtual('data_istanza_formattata')
    .get(function () {
        return this.data_istanza ? moment(this.data_istanza).format('DD-MM-YYYY') : '';
    });

GratuitoSchema
    .virtual('data_ammissione_formattata')
    .get(function () {
        return this.data_ammissione ? moment(this.data_ammissione).format('DD-MM-YYYY') : '';
    });

GratuitoSchema
    .virtual('data_istanza_liquidazione_formattata')
    .get(function () {
        return this.data_istanza_liquidazione ? moment(this.data_istanza_liquidazione).format('DD-MM-YYYY') : '';
    });

GratuitoSchema
    .virtual('data_decreto_liquidazione_formattata')
    .get(function () {
        return this.data_decreto_liquidazione ? moment(this.data_decreto_liquidazione).format('DD-MM-YYYY') : '';
    });

GratuitoSchema
    .virtual('data_pagamento_formattata')
    .get(function () {
        return this.data_pagamento ? moment(this.data_pagamento).format('DD-MM-YYYY') : '';
    });

GratuitoSchema
    .virtual('data_istanza_yyyy_mm_dd')
    .get(function () {
        return moment(this.data_istanza).format('YYYY-MM-DD');
    });

    GratuitoSchema
    .virtual('data_ammissione_yyyy_mm_dd')
    .get(function () {
        return moment(this.data_ammissione).format('YYYY-MM-DD');
    });

module.exports = mongoose.model('Gratuito', GratuitoSchema);