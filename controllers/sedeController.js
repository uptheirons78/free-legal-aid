const Sede = require('../models/sede');
const Gratuito = require('../models/gratuito');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Lista di tutte le SEDI.
exports.sede_list = function (req, res, next) {
    Sede.find()
        .sort('nome')
        .exec(function (err, list_sede) {
            if (err) { return next(err) }
            res.render('sede_list', { title: 'Sede del Giudizio', sede_list: list_sede });
        });
};

// Dettagli relativi ad ogni SEDE
exports.sede_detail = async (req, res) => {
    try {
        const sede = await Sede.findById(req.params.id);
        const sede_con_gratuito = await Gratuito.find({ 'sede': req.params.id }).populate('cliente').populate('materia');
        if (sede == null) {
            return res.status(404).send('Sede Non Trovata');
        }
        res.render('sede_detail', { title: 'Dettagli relativi alla Sede', sede, sede_con_gratuito });
    }
    catch (err) {
        err => { res.status(400).send(err) }
    }
};

// SEDE mostra FORM on GET REQ.
exports.sede_create_get = (req, res) => {
    res.render('sede_form', { title: 'Nuova Sede' });
};

// Gestione Crea SEDE on POST REQ.
exports.sede_create_post = [
    //validate that name field is not empty
    body('nome', 'Il Nome della Sede è obbligatorio').isLength({ min: 1 }).trim(),
    //sanitize (trim and escape) the name field
    sanitizeBody('nome').trim().escape(),

    //after validation and sanitization, process request
    (req, res, next) => {
        const errors = validationResult(req);
        const sede = new Sede({ nome: req.body.nome });

        if (!errors.isEmpty()) {
            res.render('sede_form', { title: 'Aggiungi Sede del Giudizio', sede, errors: errors.array() });
            return;
        }
        else {
            Sede.findOne({ 'nome': req.body.nome })
                .exec((err, found_sede) => {
                    if (err) { return next(err); }

                    if (found_sede) {
                        res.redirect(found_sede.url);
                    }

                    else {
                        sede.save((err) => {
                            err ? next(err) : res.redirect(sede.url);
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.sede_delete_get = async (req, res) => {
    try {
        const sede = await Sede.findById(req.params.id);
        const sede_con_gratuito = await Gratuito.find({ 'sede': req.params.id }).populate('cliente');
        if (sede==null) {
            res.redirect('/sede');
            return;
        }
        res.render('sede_delete', { title: 'Rimuovi Sede', sede, sede_con_gratuito });
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Handle Genre delete on POST.
exports.sede_delete_post = async (req, res) => {

    // Assume the post has valid id (ie no validation/sanitization).
    try {
        const sede = Sede.findById(req.params.id);
        const sede_con_gratuito = Gratuito.find({ 'sede': req.params.id });
        if (sede_con_gratuito.length > 0) {
            res.render('sede_delete', { title: 'Rimuovi Sede' }, sede, sede_con_gratuito);
            return;
        }
        else {
            Sede.findByIdAndRemove(req.body.id, (err) => {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.redirect('/sede');
            });
        }
    }

    catch (err) {
        err => res.status(400).send(err);
    }
};

// Display Genre update form on GET.
exports.sede_update_get = async (req, res) => {
    try {
        const sede = await Sede.findById(req.params.id);
        if (sede==null) {
            res.status(404).send('Sede Non Trovata!');
            return;
        }
        res.render('sede_form', { title: 'Modifica Sede', sede });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Handle Genre update on POST.
exports.sede_update_post = [

    // Validate that the name field is not empty.
    body('nome', 'Nome della Sede è necessario!').isLength({ min: 1 }).trim(),
    // Sanitize (trim and escape) the name field.
    sanitizeBody('nome').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request .
        const errors = validationResult(req);
        // Create a genre object with escaped and trimmed data (and the old id!)
        let sede = new Sede(
            {
                nome: req.body.nome,
                _id: req.params.id
            }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('sede_form', { title: 'Modifica Sede', sede, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Sede.findByIdAndUpdate(req.params.id, sede, {}, function (err, la_sede) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(la_sede.url);
            });
        }
    }
];