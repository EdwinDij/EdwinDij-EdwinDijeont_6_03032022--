const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

require('dotenv').config()
const db = process.env;

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

    // lien database mongoose 
mongoose.connect(db.dbUrl,
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


// middleware
app.use(helmet());


// Creating a limiter by calling rateLimit function with options:
// max contains the maximum number of request and windowMs 
// contains the time in millisecond so only max amount of 
// request can be made in windowMS time.
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this IP"
});
  
// Add the limiter function to the express middleware
// so that every request coming from user passes 
// through this middleware.
app.use(limiter);
  
// GET route to handle the request coming from user
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Hello from the express server"
    });
});
  
// Server Setup
const port = 8000;
app.listen(port, () => {
    console.log(`app is running on port ${port}`);
});

app.use('/images/', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;