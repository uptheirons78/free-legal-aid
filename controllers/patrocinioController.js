const Gratuito = require('../models/gratuito');
const Cliente = require('../models/cliente');
const Materia = require('../models/materia');
const Giudice = require('../models/giudice');
const Sede = require('../models/sede');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
const _async = require('async');

// Mostra tutte le pratiche di gratuito patrocinio
exports.gratuito_list = function (req, res, next) {
    Gratuito.find({})
        .populate('cliente')
        .populate('materia')
        .populate('giudice')
        .populate('sede')
        .sort({'fascicolo': 1})
        .exec((err, list_gratuito) => {
            if (err) { return next(err); }
            res.render('gratuito_list', { title: 'Lista di Pratiche con Gratuito Patrocinio', gratuito_list: list_gratuito });
        })
};

// Mostra pagina dettaglio singola pratica di gratuito patrocinio
exports.gratuito_detail = async (req, res) => {
    try {
        const gratuito = await Gratuito.findById(req.params.id).populate('cliente').populate('materia').populate('giudice').populate('sede');
        if (gratuito == null) {
            return res.status(404).send('Pratica Gratuito Patrocinio Non Trovata!');
        }
        res.render('gratuito_detail', { title: 'Gratuito Patrocinio', gratuito });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Mostra modulo Aggiungi Gratuito on GET.
exports.gratuito_create_get = async (req, res) => {
    try {
        const clienti = await Cliente.find().sort({ 'cognome': 1 });
        const materie = await Materia.find();
        const giudici = await Giudice.find();
        const sedi = await Sede.find();
        res.render('gratuito_form', { title: 'Nuova Pratica di Gratuito Patrocinio', clienti, materie, giudici, sedi });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Gestisce modulo Aggiungi Gratuito on POST.
exports.gratuito_create_post = [
    // Validiamo i campi.
    body('fascicolo', 'Il fascicolo non deve essere vuoto').isLength({ min: 1 }).trim(),
    body('cliente', 'Il cliente non deve essere vuoto').isLength({ min: 1 }).trim(),
    body('materia', 'La materia non deve essere vuota').isLength({ min: 1 }).trim(),
    body('giudice', 'Il campo giudice non deve essere vuoto').isLength({ min: 1 }).trim(),
    body('sede', 'Il campo sede non deve essere vuoto').isLength({ min: 1 }).trim(),
    body('data_istanza', 'Data Invalida').optional({ checkFalsy: true }).isISO8601(),


    // Sanitize fields (using wildcard).
    sanitizeBody('fascicolo').trim().escape(),
    sanitizeBody('cliente').trim().escape(),
    sanitizeBody('materia').trim().escape(),
    sanitizeBody('giudice').trim().escape(),
    sanitizeBody('sede').trim().escape(),
    sanitizeBody('data_istanza').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Crea un oggetto Gratuito Patrocinio con i dati validati e corretti.
        let gratuito = new Gratuito(
            {
                fascicolo: req.body.fascicolo,
                cliente: req.body.cliente,
                materia: req.body.materia,
                giudice: req.body.giudice,
                sede: req.body.sede,
                rg: req.body.rg,
                data_istanza: req.body.data_istanza,
                protocollo_istanza: req.body.protocollo_istanza,
                ammissione: req.body.ammissione,
                data_ammissione: req.body.data_ammissione,
                istanza_liquidazione: req.body.istanza_liquidazione,
                data_istanza_liquidazione: req.body.data_istanza_liquidazione,
                importo_istanza_liquidazione: req.body.importo_istanza_liquidazione,
                decreto_liquidazione: req.body.decreto_liquidazione,
                data_decreto_liquidazione: req.body.data_decreto_liquidazione,
                importo_decreto_liquidazione: req.body.importo_decreto_liquidazione,
                fatturazione: req.body.fatturazione,
                fattura_elettronica: req.body.fattura_elettronica,
                data_fattura: req.body.data_fattura,
                importo_fattura: req.body.importo_fattura,
                pagamento: req.body.pagamento,
                data_pagamento: req.body.data_pagamento,
                note: req.body.note
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            // Get all authors and genres for form.
            _async.parallel({
                clienti: function (callback) {
                    Cliente.find(callback);
                },
                materie: function (callback) {
                    Materia.find(callback);
                },
                giudici: function (callback) {
                    Giudice.find(callback);
                },
                sedi: function (callback) {
                    Sede.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }
                let { clienti, materie, giudici, sedi } = results;
                res.render('gratuito_form', { title: 'Nuova Pratica di Gratuito Patrocinio', clienti, materie, giudici, sedi, gratuito, errors: errors.array() });
            });
            return;
        }
        else {
            // I dati del modulo sono corretti, salviamoli
            gratuito.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new book record.
                console.log(gratuito);
                res.redirect(gratuito.url);
            });
        }
    }
];

// Mostra modulo ELIMINA PRATICA on GET.
exports.gratuito_delete_get = async (req, res) => {
    try {
        const gratuito = await Gratuito.findById(req.params.id);
        if (gratuito == null) {
            res.redirect('/gratuito');
            return;
        }
        res.render('gratuito_delete', { title: 'Rimuovi Pratica', gratuito });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Gestione ELIMINA PRATICA on POST.
exports.gratuito_delete_post = async (req, res) => {
    try {
            Gratuito.findByIdAndRemove(req.body.id, (err) => {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.redirect('/gratuito');
            });
        }

    catch (err) {
        err => res.status(400).send(err);
    }
};

// Mostra modulo AGGIORNA PRATICA on GET.
exports.gratuito_update_get = async (req, res) => {
    try {
        const gratuito = await Gratuito.findById(req.params.id).populate('cliente').populate('materia').populate('giudice').populate('sede');
        if (gratuito == null) {
            res.status(404).send('Pratica Non Trovata!');
            return;
        }
        res.render('gratuito_update', { title: 'Modifica Pratica', gratuito });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Gestisce AGGIORNAMENTO PRATICA on POST.
exports.gratuito_update_post = [
    // Valida i differenti campi
    body('fascicolo', 'Il fascicolo non deve essere vuoto').isLength({ min: 1 }).trim(),
    body('cliente', 'Il cliente non deve essere vuoto').isLength({ min: 1 }).trim(),
    body('materia', 'La materia non deve essere vuota').isLength({ min: 1 }).trim(),
    body('giudice', 'Il campo giudice non deve essere vuoto').isLength({ min: 1 }).trim(),
    body('sede', 'Il campo sede non deve essere vuoto').isLength({ min: 1 }).trim(),
    body('data_istanza', 'Data Invalida').optional({ checkFalsy: true }).isISO8601(),
    // Sanitizza i campi
    sanitizeBody('fascicolo').trim().escape(),
    sanitizeBody('cliente').trim().escape(),
    sanitizeBody('materia').trim().escape(),
    sanitizeBody('giudice').trim().escape(),
    sanitizeBody('sede').trim().escape(),
    sanitizeBody('data_istanza').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request .
        const errors = validationResult(req);
        // Create a genre object with escaped and trimmed data (and the old id!)
        let gratuito = new Gratuito(
            {
                fascicolo: req.body.fascicolo,
                cliente: req.body.cliente,
                materia: req.body.materia,
                giudice: req.body.giudice,
                sede: req.body.sede,
                rg: req.body.rg,
                data_istanza: req.body.data_istanza,
                protocollo_istanza: req.body.protocollo_istanza,
                ammissione: req.body.ammissione,
                data_ammissione: req.body.data_ammissione,
                istanza_liquidazione: req.body.istanza_liquidazione,
                data_istanza_liquidazione: req.body.data_istanza_liquidazione,
                importo_istanza_liquidazione: req.body.importo_istanza_liquidazione,
                decreto_liquidazione: req.body.decreto_liquidazione,
                data_decreto_liquidazione: req.body.data_decreto_liquidazione,
                importo_decreto_liquidazione: req.body.importo_decreto_liquidazione,
                fatturazione: req.body.fatturazione,
                fattura_elettronica: req.body.fattura_elettronica,
                data_fattura: req.body.data_fattura,
                importo_fattura: req.body.importo_fattura,
                pagamento: req.body.pagamento,
                data_pagamento: req.body.data_pagamento,
                note: req.body.note,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            _async.parallel({
                clienti: function (callback) {
                    Cliente.find(callback);
                },
                materie: function (callback) {
                    Materia.find(callback);
                },
                giudici: function (callback) {
                    Giudice.find(callback);
                },
                sedi: function (callback) {
                    Sede.find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }
                let { clienti, materie, giudici, sedi } = results;
                res.render('gratuito_update', { title: 'Modifica Pratica', clienti, materie, giudici, sedi, gratuito, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Gratuito.findByIdAndUpdate(req.params.id, gratuito, {}, function (err, la_pratica) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(la_pratica.url);
            });
        }
    }
];
