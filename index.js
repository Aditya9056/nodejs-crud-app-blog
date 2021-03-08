const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('./config/database');
const flash = require('connect-flash');
const passport = require('passport');

// DB Connection
// mongoose.connect(
// 	process.env.DB_CONNECT,
// 	{ useNewUrlParser: true, useUnifiedTopology: true },
// 	() => console.log('Connected to DB!')
// );

mongoose.connect(config.database, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

let db = mongoose.connection;
db.once('open', () => {
	console.log('Connected to Database');
});

//Check for DB errors
db.on('error', (err) => {
	console.log(err);
});

// Init app
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(
	session({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true,
	})
);

// Express messages middleware
app.use(flash());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
	res.locals.user = req.user || null;
	next();
});

//Home Route
app.get('/', (req, res) => {
	Article.find({}, (err, articles) => {
		if (err) {
			console.log(err);
		} else {
			res.render('index', {
				title: 'Articles',
				articles: articles,
			});
		}
	});
});

// Route files
let articles = require('./routes/articles');
let users = require('./routes/users');

app.use('/article', articles);
app.use('/add-article', articles);
app.use('/delete-article', articles);
app.use('/edit-article', articles);
app.use('/users', users);

app.listen(process.env.PORT, () => {
	console.log('Server Running');
});
