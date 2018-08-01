const Gratuito = require('../models/gratuito');
const Cliente = require('../models/cliente');
const Materia = require('../models/materia');
const Giudice = require('../models/giudice');
const Sede = require('../models/sede');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Mostra tutte le pratiche di gratuito patrocinio
exports.gratuito_list = function (req, res, next) {
    let noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Gratuito.aggregate([
            { $lookup: { from: "clientes", localField: "cliente", foreignField: "_id", as: "cliente" } },
            { $lookup: { from: "materias", localField: "materia", foreignField: "_id", as: "materia" } },
            { $lookup: { from: "giudices", localField: "giudice", foreignField: "_id", as: "giudice" } },
            { $lookup: { from: "sedes", localField: "sede", foreignField: "_id", as: "sede" } },
            { $unwind: "$cliente"},
            { $unwind: "$materia" },
            { $unwind: "$giudice" },
            { $unwind: "$sede" },
            { $match:
                { $or:
                    [
                        { "cliente.nome": regex },
                        { "cliente.cognome": regex },
                        { "fascicolo": regex },
                        { "rg": regex },
                        { "materia.nome": regex },
                        { "giudice.nome": regex },
                        { "sede.nome": regex },
                        { "ammissione": regex },
                    ]
                }
            },
            { $sort: { 'fascicolo': 1 } }
        ])
        .exec((err, list_gratuito) => {
                if (err) {
                    return next(err);
                }
                else {
                    res.render('gratuito_search', { title: 'Lista di Pratiche con Gratuito Patrocinio', gratuito_list: list_gratuito });
                    if (list_gratuito.length < 1) {
                        noMatch = "No gratuito, please try again!";
                    }
                }
        });
    }
    else {
        Gratuito.find({})
            .populate('cliente')
            .populate('materia')
            .populate('giudice')
            .populate('sede')
            .sort({'fascicolo': 1})
            .exec((err, list_gratuito) => {
                if (err) { return next(err); }
                res.render('gratuito_list', { title: 'Lista di Pratiche con Gratuito Patrocinio', gratuito_list: list_gratuito });
            });
    }
};

// Mostra SOLTANTO le pratiche di gratuito patrocinio con status: NON AMMESSO
exports.non_amesso = async (req, res, next) => {
    try {
        const list_gratuito = await Gratuito.find({ 'ammissione': 'NON AMMESSO' })
            .populate('cliente')
            .populate('materia')
            .populate('giudice')
            .populate('sede')
            .sort({'fascicolo': 1});

            res.render('gratuito_list', { title: 'Lista di Pratiche con Gratuito Patrocinio: NON AMMESSO', gratuito_list: list_gratuito });
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Mostra le pratiche di gratuito patrocinio fatturate
exports.fatturate = async (req, res, next) => {
    try {
        const list_gratuito = await Gratuito.find({ 'decreto_liquidazione': 'SI', 'fatturazione': 'SI' })
            .populate('cliente')
            .populate('materia')
            .populate('giudice')
            .populate('sede')
            .sort({ 'fattura_elettronica': 1 });

        res.render('gratuito_list', { title: 'Lista di Pratiche con Gratuito Patrocinio: FATTURATE', gratuito_list: list_gratuito });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
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
    // Sanitizza i campi richiesti - non tutti, soltanto i necessari.
    sanitizeBody('fascicolo').trim().escape(),
    sanitizeBody('cliente').trim().escape(),
    sanitizeBody('materia').trim().escape(),
    sanitizeBody('giudice').trim().escape(),
    sanitizeBody('sede').trim().escape(),
    sanitizeBody('data_istanza').toDate(),
    // Dopo la validazione e sanitizzazione dei campi, processa la richiesta
    async (req, res, next) => {
        // Estrae eventuali errori.
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
            // Ci sono errori e rende nuovamente il modulo con valori sanitizzati o validati, oppure messaggi di errore.
            // Estrae tutti i valori necessari per il modulo.
            try {
                const clienti = await Cliente.find();
                const materie = await Materia.find();
                const giudici = await Giudice.find();
                const sedi = await Sede.find();
                res.render('gratuito_form', { title: 'Nuova Pratica di Gratuito Patrocinio', clienti, materie, giudici, sedi, gratuito, errors: errors.array() });
                return;
            }
            catch(err) {
                err => res.status(400).send(err);
            }
        }
        else {
            // I dati del modulo sono corretti, salviamoli
            gratuito.save(function (err) {
                if (err) { return next(err); }
                //in caso di successo fa il redirect alla pagina dettaglio della pratica.
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
        const clienti = await Cliente.find();
        const materie = await Materia.find();
        const giudici = await Giudice.find();
        const sedi = await Sede.find();
        if (gratuito == null) {
            res.status(404).send('Pratica Non Trovata!');
            return;
        }
        res.render('gratuito_update', { title: 'Modifica Pratica', gratuito, clienti, materie, giudici, sedi });
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

    async (req, res, next) => {
        const errors = validationResult(req);

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
            try {
                const clientiPromise = Cliente.find();
                const materiaPromise = Materia.find();
                const giudiciPromise = Giudice.find();
                const sediPromise = Sede.find();

                const [clienti, materie, giudici, sedi] = await Promise.All([clientiPromise, materiaPromise, giudiciPromise, sediPromise]);
                res.render('gratuito_update', { title: 'Modifica Pratica', clienti, materie, giudici, sedi, gratuito, errors: errors.array() });
            }
            catch(err) {
                err => res.status(400).send(err);
            }
        }
        else {
            Gratuito.findByIdAndUpdate(req.params.id, gratuito, {}, function (err, la_pratica) {
                if (err) { return next(err); }
                res.redirect(la_pratica.url);
            });
        }
    }
];

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
