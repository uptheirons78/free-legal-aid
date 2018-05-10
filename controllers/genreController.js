const Genre = require('../models/genre');
const Book = require('../models/book');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
const _async = require("async");
// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find()
        .sort('name')
        .exec(function(err, list_genres) {
           if(err) {return next(err)}
           res.render('genre_list', {title: 'Genre List', genre_list: list_genres})
        });
};

// Display detail page for a specific Genre.
exports.genre_detail = async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        const genre_books = await Book.find({ 'genre': req.params.id });
        if (genre==null) {
            return res.status(404).send('Genre Not Found');
        }
        res.render('genre_detail', { title: 'Genre Detail', genre, genre_books });
    }
    catch(err) {
        err => {res.status(400).send(err)}
    }
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    //validate that name field is not empty
    body('name', 'Genre name required').isLength({min:1}).trim(),
    //sanitize (trim and escape) the name field
    sanitizeBody('name').trim().escape(),
    
    //after validation and sanitization, process request
    (req, res, next) => {
        const errors = validationResult(req);
        const genre = new Genre({ name: req.body.name });
        
        if(!errors.isEmpty()) {
            res.render('genre_form', { title: 'Create Genre', genre, errors: errors.array() });
            return;
        }
        else {
            Genre.findOne({ 'name': req.body.name })
                .exec((err, found_genre) => {
                    if(err) { return next(err); }
                    
                    if(found_genre) {
                        res.redirect(found_genre.url);
                    }
                    
                    else {
                        genre.save((err) => {
                            err ? next(err) : res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {

    _async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            res.redirect('/catalog/genres');
        }
        // Successful, so render.
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books } );
    });

};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res) => {
    
    // Assume the post has valid id (ie no validation/sanitization).
    try {
        const genre = Genre.findById(req.params.id);
        const genre_books = Book.find({'genre': req.params.id});
        if (genre_books.length > 0) {
            res.render('genre_delete', {title: 'Delete Genre'}, genre, genre_books);
            return; 
        }
        else {
            Genre.findByIdAndRemove(req.body.id, (err) => {
                if(err) {
                    res.status(400).send(err);
                    return;
                }
                res.redirect('/catalog/genres');
            });
        }
    }
    
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        if(genre == null) {
            res.status(404).send('Genre Not Found');
            return;
        }
        res.render('genre_form', {title: 'Update Genre', genre});
    }
    catch(err) {
        err => res.status(400).send(err);
    }
};

// Handle Genre update on POST.
exports.genre_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data (and the old id!)
        var genre = new Genre(
          {
          name: req.body.name,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('genre_form', { title: 'Update Genre', genre, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err,thegenre) {
                if (err) { return next(err); }
                   // Successful - redirect to genre detail page.
                   res.redirect(thegenre.url);
                });
        }
    }
];