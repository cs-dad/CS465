
const express = require('express');
const path = require('path');
const handlerBars = require('hbs');
const cors = require('cors');

/**
 * Migrated this to a separate function to keep the app.js cleaner.
 */
const setupCS465Applet = () => {
    // cs465
    const cs465 = express();
    cs465.use(express.static(path.join(__dirname, '/public')));

    cs465.use('/spa', express.static(path.join(__dirname, 'spa')));

    // create a fallback for the spa to just direct to the index.html
    cs465.get('/spa', (req, res) => {
        res.sendFile(path.join(__dirname, 'spa', 'index.html'));
    });

    cs465.set('views', path.join(__dirname, 'app_server', 'views'));

    handlerBars.registerPartials(path.join(__dirname, 'app_server', 'views', 'partials'));

    cs465.set('view engine', 'hbs');

    // Open CORS for /api on this subdomain (allows any external app to POST/GET/etc.)
    const apiCors = cors({
        origin: (origin, cb) => cb(null, true), // reflect any Origin
        methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
        allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
        credentials: false, // set true only if you need cookies across sites
        maxAge: 86400
    });

    cs465.use('/api', apiCors);

    // import all of our routes for cs465
    const indexRouter = require('./app_server/routes/index');
    const travelRouter = require('./app_server/routes/travel');

    const apiIndexRouter = require('./app_server/api/routes/index');
    // the handbook didn't specify what the user's router would be, so I'm going to not include it for the time being

    // bring in the database
    const mongoose = require('./app_server/api/models/db');

    // use the routes
    cs465.use('/', indexRouter);
    cs465.use('/travel', travelRouter);
    cs465.use('/api', apiIndexRouter);

    return cs465;
}

module.exports = setupCS465Applet;