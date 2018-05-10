const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

const _async = require("async");

exports.index = function(req, res) {

    _async.parallel({
        book_count: function(callback) {
            Book.count({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function(callback) {
            BookInstance.count({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.count({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.count({}, callback);
        },
        genre_count: function(callback) {
            Genre.count({}, callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Free Legal Aid', error: err, data: results });
    });
};

// Display list of all books.
exports.book_list = function(req, res, next) {
    Book.find({}, 'title author summary')
        .populate('author')
        .exec((err, list_books) => {
            if(err) {return next(err);}

            res.render('book_list', {title: 'Book List', book_list: list_books});
        })
};

// Display detail page for a specific book.
exports.book_detail = async(req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').populate('genre');
        const book_instances = await BookInstance.find( { 'book': req.params.id } );
        if (book==null) {
            return res.status(404).send('Book Not Found');
        }
        res.render('book_detail', { title: 'Title', book, book_instances });
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Display book create form on GET.
exports.book_create_get = async (req, res) => {
    try {
        const authors = await Author.find();
        const genres = await Genre.find();
        res.render('book_form', { title: 'Create Book', authors, genres});
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            _async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];

// Display book delete form on GET.
exports.book_delete_get = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').populate('genre');
        const book_instances = await BookInstance.find({ 'book': req.params.id });
        if (book==null) {
            res.redirect('/catalog/books');
        }
        res.render('book_delete', { title: 'Delete Book', book, book_instances });
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Handle book delete on POST.
exports.book_delete_post = async(req, res) => {

    // Assume the post has valid id (ie no validation/sanitization).
    try {
        const book = await Book.findById(req.params.id).populate('author').populate('genre');
        const book_instances = await BookInstance.find({ 'book': req.params.id });
        if (book_instances.length > 0) {
            // Book has book_instances. Render in same way as for GET route.
            res.render('book_delete', { title: 'Delete Book', book, book_instances });
            return;
        }
        else {
            // Book has no BookInstance objects. Delete object and redirect to the list of books.
            Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
                if (err) {
                    return res.status(400).send(err);
                }
                // Success - got to books list.
                res.redirect('/catalog/books');
            });
        }
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Display book update form on GET.
exports.book_update_get = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').populate('genre');
        const authors = await Author.find();
        const genres = await Genre.find();
        if (book==null) {
            res.status(404).send('Book Not Found');
            return;
        }
        // Success
        for(let all_g_iter = 0; all_g_iter < genres.length; all_g_iter++) {
            for(let book_g_iter = 0; book_g_iter < book.genre.length; book_g_iter++) {
                if(genres[all_g_iter]._id.toString() == book.genre[book_g_iter]._id.toString()) {
                    genres[all_g_iter].checked = 'true';
                }
            }
        }
        res.render('book_form', {title: 'Update Book', authors, genres, book});
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            _async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];