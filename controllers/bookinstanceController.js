const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    
    BookInstance.find()
        .populate('book')
        .exec((err, list_bookinstances) => {
           if(err) {return next(err);}
           res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances});
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res) => {
    try {
        const bookinstance = await BookInstance.findById(req.params.id).populate('book');
        if (bookinstance==null) {
            return res.status(404).send('Book Copy Not Found');
        }
        res.render('bookinstance_detail', {title: 'Book', bookinstance});
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res) => {
    try {
    const books = await Book.find({}, 'title');
    res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books});
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async(req, res) => {
    try {
        const bookinstance = await BookInstance.findById(req.params.id).populate('book');
        if (bookinstance==null) {
            res.status(404).send('BookInstance Not Found');
            return;
        }
        res.render('bookinstance_delete', {title: 'Delete BookInstance', bookinstance});
    }
    catch(err) {
        res.status(400).send(err);
    }
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    BookInstance.findByIdAndRemove(req.body.id, (err) => {
        err ? res.status(400).send(err) : res.redirect('/catalog/bookinstances');
    });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async(req, res) => {
    try {
        const bookinstance = await BookInstance.findById(req.params.id).populate('book');
        const books = await Book.find();
        if(bookinstance==null) {
            res.status(404).send('BookInstance Not Found');
            return;
        }
        res.render('bookinstance_form', {title: 'Update BookInstance', book_list : books, selected_book : bookinstance.book._id, bookinstance})
        
    }
    catch(err) {
        res.status(400).send(err);
    }
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped/trimmed data and current id.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Update BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err,thebookinstance) {
                if (err) { return next(err); }
                   // Successful - redirect to detail page.
                   res.redirect(thebookinstance.url);
                });
        }
    }
];