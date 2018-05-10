const Author = require("../models/author");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    Author.find()
        .sort({'family_name': 1})
        .exec(function(err, list_authors) {
            if(err) { return next(err); }
            res.render('author_list', { title: 'Author List', author_list: list_authors});
        });
};

// Display detail page for a specific Author.
exports.author_detail = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const author_books = await Book.find({ 'author': req.params.id }, 'title summary');
        if (author==null) {
            return res.status(404).send('Author Not Found');
        }
        res.render('author_detail', { title: 'Author Detail', author, author_books});
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST.
exports.author_create_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Author object with escaped and trimmed data.
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            author.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(author.url);
            });
        }
    }
];

// Display Author delete form on GET.
exports.author_delete_get = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const author_books = await Book.find({ 'author': req.params.id });
        if (author==null) {
            res.redirect('/catalog/authors');
        }
        res.render('author_delete', { title: 'Delete Author', author, author_books });
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Handle Author delete on POST.
exports.author_delete_post = async(req, res) => {
    try {
        const author = await Author.findById(req.body.authorid);
        const author_books = await Book.find({ 'author': req.body.authorid });
        if (author_books.length > 0) {
            res.render('author_delete', { title: 'Delete Author', author, author_books } );
            return;
        }
        else {
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if(err) {return res.status(400).send(err)}
                res.redirect('/catalog/authors');
            });
        }
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Display Author update form on GET.
exports.author_update_get = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        if (author == null) {
            res.status(404).send('Author Not Found');
            return;
        }
        res.render('author_form', { title: 'Update Author', author});
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Handle Author update on POST. Done with callback, not async-await
exports.author_update_post = (req, res) => {
        let author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            }
        );
        Author.findByIdAndUpdate(req.params.id, author, {}, (err, theAuthor) => {
            if(err) {return res.status(400).send(err)}
            res.redirect(theAuthor.url);
        });
        
};