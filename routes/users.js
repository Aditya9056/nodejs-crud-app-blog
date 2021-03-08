const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', (_req, res) => {
	res.render('register', {
		title: 'Register',
	});
});

// Register Process
router.post(
	'/register',
	check('name', 'name is required').notEmpty().isString().trim(),
	check('email', 'e-mail is not valid')
		.notEmpty()
		.isEmail()
		.exists()
		.trim()
		.custom((_value, { req }) => {
			return new Promise((resolve, reject) => {
				User.findOne({ email: req.body.email }, function (err, user) {
					if (err) {
						reject(new Error('Server Error'));
					}
					if (Boolean(user)) {
						reject(new Error('E-mail already in use'));
					}
					resolve(true);
				});
			});
		}),
	check('username', 'username is required')
		.notEmpty()
		.isString()
		.exists()
		.trim()
		.custom((_value, { req }) => {
			return new Promise((resolve, reject) => {
				User.findOne({ username: req.body.username }, function (err, user) {
					if (err) {
						reject(new Error('Server Error'));
					}
					if (Boolean(user)) {
						reject(new Error('Username already in use'));
					}
					resolve(true);
				});
			});
		}),
	check('password', 'password is required').notEmpty().isString(),
	(req, res) => {
		check('password', 'passwords do not match').equals(req.body.cpassword);

		let errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('register', {
				errors: errors,
			});
		} else {
			const name = req.body.name;
			const email = req.body.email;
			const username = req.body.username;
			const password = req.body.password;

			let newUser = new User({
				name: name,
				email: email,
				username: username,
				password: password,
			});

			bcrypt.genSalt(10, (err, salt) => {
				if (err) {
					console.log(err);
				}
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) {
						console.log(err);
					} else {
						newUser.password = hash;
						newUser.save((err) => {
							if (err) {
								console.log(err);
								return;
							} else {
								req.flash('success', "you're now registered and can log in.");
								res.redirect('/users/login');
							}
						});
					}
				});
			});
		}
	}
);

// Login Form
router.get('/login', (_req, res) => {
	res.render('login', {
		title: 'Login',
	});
});

// Login Process
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true,
		successFlash: 'welcome home!',
	})(req, res, next);
});

// Logout
router.get('/logout', (req, res, _next) => {
	req.logout();
	req.flash('success', 'successfully logout');
	res.redirect('/');
});

module.exports = router;
