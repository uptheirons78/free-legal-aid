const Materia = require('../models/materia');
const Gratuito = require('../models/gratuito');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Lista di tutte le MATERIE.
exports.materia_list = function (req, res, next) {
    Materia.find()
        .sort('nome')
        .exec(function (err, list_materia) {
            if (err) { return next(err) }
            res.render('materia_list', { title: 'Materia', materia_list: list_materia })
        });
};

// Dettagli relativi ad ogni MATERIA
exports.materia_detail = async(req, res) => {
    try {
        const materia = await Materia.findById(req.params.id);
        const materia_con_gratuito = await Gratuito.find({ 'materia': req.params.id }).populate('cliente');
        if (materia == null) {
            return res.status(404).send('Materia Non Trovata');
        }
        res.render('materia_detail', { title: 'Dettaglio Materia', materia, materia_con_gratuito });
    }
    catch (err) {
        err => { res.status(400).send(err) }
    }
};

// MATERIA mostra FORM on GET REQ.
exports.materia_create_get = (req, res) => {
    res.render('materia_form', { title: 'Nuova Materia' });
};

// Gestione Crea MATERIA on POST REQ.
exports.materia_create_post = [
    //validate that name field is not empty
    body('nome', 'Nome della Materia è obbligatorio').isLength({ min: 1 }).trim(),
    //sanitize (trim and escape) the name field
    sanitizeBody('nome').trim().escape(),

    //after validation and sanitization, process request
    (req, res, next) => {
        const errors = validationResult(req);
        const materia = new Materia({ nome: req.body.nome });

        if (!errors.isEmpty()) {
            res.render('materia_form', { title: 'Aggiungi Materia', materia, errors: errors.array() });
            return;
        }
        else {
            Materia.findOne({ 'nome': req.body.nome })
                .exec((err, found_materia) => {
                    if (err) { return next(err); }

                    if (found_materia) {
                        res.redirect(found_materia.url);
                    }

                    else {
                        materia.save((err) => {
                            err ? next(err) : res.redirect(materia.url);
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.materia_delete_get = async (req, res) => {
    try {
        const materia = await Materia.findById(req.params.id);
        const materia_con_gratuito = await Gratuito.find({ 'materia': req.params.id }).populate('cliente');
        if (materia == null) {
            res.redirect('/materia');
            return;
        }
        res.render('materia_delete', { title: 'Rimuovi Materia', materia, materia_con_gratuito });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Handle Genre delete on POST.
exports.materia_delete_post = async (req, res) => {
    try {
        const materia = Materia.findById(req.params.id);
        const materia_con_gratuito = Gratuito.find({ 'materia': req.params.id });
        if (materia_con_gratuito.length > 0) {
            res.render('materia_delete', { title: 'Rimuovi Materia' }, materia, materia_con_gratuito);
            return;
        }
        else {
            Materia.findByIdAndRemove(req.body.id, (err) => {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.redirect('/materia');
            });
        }
    }

    catch (err) {
        err => res.status(400).send(err);
    }
};

// Display Genre update form on GET.
exports.materia_update_get = async (req, res) => {
    try {
        const materia = await Materia.findById(req.params.id);
        if (materia == null) {
            res.status(404).send('Materia Non Trovata!');
            return;
        }
        res.render('materia_form', { title: 'Modifica Materia', materia });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Handle Genre update on POST.
exports.materia_update_post = [

    // Validate that the name field is not empty.
    body('nome', 'Nome della Materia è necessario!').isLength({ min: 1 }).trim(),
    // Sanitize (trim and escape) the name field.
    sanitizeBody('nome').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request .
        const errors = validationResult(req);
        // Create a genre object with escaped and trimmed data (and the old id!)
        let materia = new Materia(
            {
                nome: req.body.nome,
                _id: req.params.id
            }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('materia_form', { title: 'Modifica Materia', materia, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Materia.findByIdAndUpdate(req.params.id, materia, {}, function (err, la_materia) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(la_materia.url);
            });
        }
    }
];