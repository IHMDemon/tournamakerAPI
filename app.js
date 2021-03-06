require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const passport     = require('passport');
const session      = require('express-session');
const passportSetup= require('./config/passport');
const cors         = require('cors');

passportSetup(passport);

mongoose.Promise = Promise;
mongoose
.connect(process.env.MONGODB_URI, {useMongoClient: true})
  .then(() => {
    console.log('Connected to Mongo!')
  }).catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


app.use(session({
  secret: 'angular auth passport secret shh',
  resave: true,
  saveUninitialized: true,
  cookie : {httpOnly: true, maxAge: 2419200000}
}));

app.use(passport.initialize());
app.use(passport.session());


// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

app.use(cors({
  credentials:true,
  origin: ['http://localhost:4200']
}))

const index = require('./routes/index');
app.use('/', index);

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const teamRoutes = require('./routes/teamRoutes');
app.use('/api', teamRoutes);

const tournamentRoutes = require('./routes/tournamentRoutes')
app.use('/api', tournamentRoutes);

//THE LINE BELOW CALLS YOUR ANGULAR2 APP.
//THIS WILL INTERFERE WITH DEV, SO COMMENT IT OUT WHEN DEV. 
//REACTIVATE IT WHEN PRODUCTION TIME
  // app.use((req, res, next) => {
  //   res.sendfile(__dirname + '/public/index.html');
  // });

module.exports = app;
