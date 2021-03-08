const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Bring in Article Model
let Article = require('../models/article');

// User Model
let User = require('../models/user');

// Get Single Article
router.get('/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		if (err) {
			console.log(err);
		} else {
			User.findById(article._id, (err, user) => {
				if (err) {
					console.log(err);
				} else {
					res.render('article', {
						article: article,
					});
				}
			});
		}
		return;
	});
});

// Edit Article
router.get('/edit/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		if (err) {
			console.log(err);
		} else {
			if (article.author != req.user._id) {
				req.flash('danger', 'not a valid request');
				res.redirect('/');
				return;
			}
			res.render('edit-article', {
				title: 'Edit ' + article.title,
				article: article,
			});
		}
		return;
	});
});

// Add Route
router.get('/', ensureAuthenticated, (req, res) => {
	res.render('add-article', {
		title: 'Add an Article',
	});
});

// (POST)Sumbmit Add Article Request Route
router.post(
	'/',
	ensureAuthenticated,
	check('title', 'Title is required').notEmpty(),
	// check('author', 'Author is required').notEmpty(),
	check('body', 'Body is required').notEmpty(),
	(req, res) => {
		// Get Errors
		let errors = validationResult(req);

		// console.log(errors.errors[0].msg);

		if (!errors.isEmpty()) {
			res.render('add-article', {
				title: 'Add an Article',
				errors: errors.errors,
			});
			// console.log('======new=====');
			// console.log(errors);
		} else {
			let article = new Article();
			article.title = req.body.title;
			article.author = req.user.name;
			article.body = req.body.body;

			article.save((err) => {
				if (err) {
					console.log('Error in Saving Article ->', err);
					return;
				} else {
					req.flash('success', 'Article Added');
					res.redirect('/');
				}
			});
		}
	}
);

//(POST)Edit Article Request Route
router.post('/:id', ensureAuthenticated, (req, res) => {
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = { _id: req.params.id };

	Article.updateMany(query, article, (err) => {
		if (err) {
			console.log('Error in Saving Article ->', err);
			return;
		} else {
			req.flash('success', 'Article Updated');
			res.redirect('/');
		}
	});
});

// Delete Request
router.delete('/:id', ensureAuthenticated, (req, res) => {
	const query = { _id: req.params.id };

	Article.findById(req.params.id, (err, article) => {
		if (article.author != req.user._id) {
			res.status(500).send();
		} else {
			Article.deleteMany(query, (err) => {
				if (err) {
					console.log(err);
				} else {
					req.flash('danger', 'Article Deleted');
					res.send('Success');
				}
			});
		}
	});
});

// Access Control
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('danger', "you're not logged in");
		res.redirect('/users/login');
	}
}

module.exports = router;
