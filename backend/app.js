const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

app.use(helmet());
app.use(mongoSanitize());

require('dotenv').config()
const db = process.env;

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

    // lien database mongoose 
mongoose.connect('mongodb+srv://EdwinAdm:PbveaZ5VCOY7kkB9@piiquante.6sa2s.mongodb.net/Piiquante?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
    mongoSanitize({
      allowDots: true,
    }),
  );

  app.use(
    mongoSanitize({
      allowDots: true,
      replaceWith: '_',
    }),
  );

  import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;