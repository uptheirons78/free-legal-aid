const Giudice = require('../models/giudice');
const Gratuito = require('../models/gratuito');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Lista di tutti i GIUDICI.
exports.giudice_list = function (req, res, next) {
    Giudice.find()
        .sort('nome')
        .exec(function (err, list_giudici) {
            if (err) { return next(err) }
            res.render('giudice_list', { title: 'Giudici e Gradi di Giudizio', giudici_list: list_giudici })
        });
};

// Dettagli relativi ad ogni GIUDICE
exports.giudice_detail = async (req, res) => {
    try {
        const giudice = await Giudice.findById(req.params.id);
        const giudice_con_gratuito = await Gratuito.find({ 'giudice': req.params.id }).populate('cliente');
        if (giudice == null) {
            return res.status(404).send('Giudice o Grado di Giudizio Non Trovato');
        }
        res.render('giudice_detail', { title: 'Dettagli relativi al Giudice', giudice, giudice_con_gratuito });
    }
    catch (err) {
        err => { res.status(400).send(err) }
    }
};

// GIUDICE mostra FORM on GET REQ.
exports.giudice_create_get = (req, res) => {
    res.render('giudice_form', { title: 'Nuovo Giudice o Grado di Giudizio' });
};

// Gestione Crea MATERIA on POST REQ.
exports.giudice_create_post = [
    //validate that name field is not empty
    body('nome', 'Nome del Giudice è obbligatorio').isLength({ min: 1 }).trim(),
    //sanitize (trim and escape) the name field
    sanitizeBody('nome').trim().escape(),

    //after validation and sanitization, process request
    (req, res, next) => {
        const errors = validationResult(req);
        const giudice = new Giudice({ nome: req.body.nome });

        if (!errors.isEmpty()) {
            res.render('giudice_form', { title: 'Aggiungi Giudice o Grado di Giudizio', giudice, errors: errors.array() });
            return;
        }
        else {
            Giudice.findOne({ 'nome': req.body.nome })
                .exec((err, found_giudice) => {
                    if (err) { return next(err); }

                    if (found_giudice) {
                        res.redirect(found_giudice.url);
                    }

                    else {
                        giudice.save((err) => {
                            err ? next(err) : res.redirect(giudice.url);
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.giudice_delete_get = async (req, res) => {
    try {
        const giudice = await Giudice.findById(req.params.id);
        const giudice_con_gratuito = await Gratuito.find({ 'giudice': req.params.id }).populate('cliente');
        if (giudice == null) {
            res.redirect('/giudici');
            return;
        }
        res.render('giudice_delete', { title: 'Rimuovi Giudice', giudice, giudice_con_gratuito });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Handle Genre delete on POST.
exports.giudice_delete_post = async (req, res) => {
    try {
        const giudice = Giudice.findById(req.params.id);
        const giudice_con_gratuito = Gratuito.find({ 'sede': req.params.id }).populate('cliente');
        if (giudice_con_gratuito.length > 0) {
            res.render('giudice_delete', { title: 'Rimuovi Giudice' }, giudice, giudice_con_gratuito);
            return;
        }
        else {
            Giudice.findByIdAndRemove(req.body.id, (err) => {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.redirect('/giudici');
            });
        }
    }

    catch (err) {
        err => res.status(400).send(err);
    }
};

// Display Genre update form on GET.
exports.giudice_update_get = async (req, res) => {
    try {
        const giudice = await Giudice.findById(req.params.id);
        if (giudice == null) {
            res.status(404).send('Giudice Non Trovato!');
            return;
        }
        res.render('giudice_form', { title: 'Modifica Giudice', giudice });
    }
    catch (err) {
        err => res.status(400).send(err);
    }
};

// Handle Genre update on POST.
exports.giudice_update_post = [

    // Validate that the name field is not empty.
    body('nome', 'Il Nome del Giudice è Necessario!').isLength({ min: 1 }).trim(),
    // Sanitize (trim and escape) the name field.
    sanitizeBody('nome').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request .
        const errors = validationResult(req);
        // Create a genre object with escaped and trimmed data (and the old id!)
        let giudice = new Giudice(
            {
                nome: req.body.nome,
                _id: req.params.id
            }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('giudice_form', { title: 'Modifica Giudice', giudice, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Giudice.findByIdAndUpdate(req.params.id, giudice, {}, function (err, il_giudice) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(il_giudice.url);
            });
        }
    }
];