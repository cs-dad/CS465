
const express = require('express');
const path = require('path');
const handlerBars = require('hbs');

/**
 * Migrated this to a separate function to keep the app.js cleaner.
 */
const setupCS465Applet = () => {
    // cs465
    const cs465 = express();
    cs465.use(express.static(path.join(__dirname, '/public')));

    cs465.set('views', path.join(__dirname, 'app_server', 'views'));

    handlerBars.registerPartials(path.join(__dirname, 'app_server', 'views', 'partials'));

    cs465.set('view engine', 'hbs');

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