const Cliente = require("../models/cliente");
const Gratuito = require('../models/gratuito');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

exports.clienti_list = function (req, res, next) {
    Cliente.find()
        .sort({ 'cognome': 1 })
        .exec(function (err, list_clienti) {
            if (err) { return next(err); }
            res.render('clienti_list', { title: 'Anagrafiche Clienti', clienti_list: list_clienti });
        });
};

exports.clienti_detail = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        const pratiche_cliente = await Gratuito.find({ 'cliente': req.params.id }).populate('materia').populate('giudice').populate('sede');
        if (cliente == null) {
            return res.status(404).send('Questo Cliente Non Esiste');
        }
        res.render('clienti_detail', { title: 'Anagrafica Cliente', cliente, pratiche_cliente });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

exports.clienti_create_get = function (req, res) {
    res.render('clienti_form', { title: 'Nuova Anagrafica Cliente' });
};

exports.clienti_create_post = [

    body('nome').isLength({ min: 1 }).trim().withMessage('Il Nome deve essere specificato!')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('cognome').isLength({ min: 1 }).trim().withMessage('Il Cognome deve essere specificato!')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('data_di_nascita', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('luogo_di_nascita').isLength({ min: 1 }).trim().withMessage('Il Luogo di Nascita deve essere specificato!')
        .isAlphanumeric().withMessage('Place of Birth has non-alphanumeric characters.'),

    sanitizeBody('nome').trim().escape(),
    sanitizeBody('cognome').trim().escape(),
    sanitizeBody('data_di_nascita').toDate(),
    sanitizeBody('luogo_di_nascita').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('clienti_form', { title: 'Nuova Anagrafica Cliente', cliente: req.body, errors: errors.array() });
            return;
        }
        else {
            let cliente = new Cliente(
                {
                    nome: req.body.nome,
                    cognome: req.body.cognome,
                    data_di_nascita: req.body.data_di_nascita,
                    luogo_di_nascita: req.body.luogo_di_nascita
                });
            cliente.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(cliente.url);
            });
        }
    }
];

exports.clienti_delete_get = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        const cliente_con_gratuito = await Gratuito.find({ 'cliente': req.params.id }).populate('cliente');
        if (cliente == null) {
            res.redirect('/clienti');
            return;
        }
        res.render('clienti_delete', { title: 'Rimuovi Cliente', cliente, cliente_con_gratuito });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

exports.clienti_delete_post = async (req, res) => {
    try {
        const cliente = Cliente.findById(req.params.id);
        const cliente_con_gratuito = Gratuito.find({ 'cliente': req.params.id });
        if (cliente_con_gratuito.length > 0) {
            res.render('clienti_delete', { title: 'Rimuovi Cliente' }, cliente, cliente_con_gratuito);
            return;
        }
        else {
            Cliente.findByIdAndRemove(req.body.id, (err) => {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.redirect('/clienti');
            });
        }
    }

    catch (err) {
        err => res.status(400).send(err);
    }
};

exports.clienti_update_get = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (cliente == null) {
            res.status(404).send('Cliente Non Trovato!');
            return;
        }
        res.render('clienti_form', { title: 'Modifica Cliente', cliente });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

exports.clienti_update_post = [

    body('nome', 'Il nome del cliente è necessario!').isLength({ min: 1 }).trim(),
    body('cognome', 'Il cognome del cliente è necessario!').isLength({ min: 1 }).trim(),
    body('data_di_nascita', 'Data di nascita non valida!').optional({ checkFalsy: true }).isISO8601(),
    body('luogo_di_nascita', 'Il luogo di nascita del cliente è necessario!').isLength({ min: 1 }).trim(),

    sanitizeBody('nome').trim().escape(),
    sanitizeBody('cognome').trim().escape(),
    sanitizeBody('data_di_nascita').toDate(),
    sanitizeBody('luogo_di_nascita').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        let cliente = new Cliente(
            {
                nome: req.body.nome,
                cognome: req.body.cognome,
                data_di_nascita: req.body.data_di_nascita,
                luogo_di_nascita: req.body.luogo_di_nascita,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            res.render('clienti_form', { title: 'Modifica Cliente', cliente, errors: errors.array() });
            return;
        }
        else {
            Cliente.findByIdAndUpdate(req.params.id, cliente, {}, function (err, il_cliente) {
                if (err) { return next(err); }
                res.redirect(il_cliente.url);
            });
        }
    }
];
