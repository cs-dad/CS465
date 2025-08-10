/**
 * File to seed the database with our json data.
 */

const Mongoose = require('./db');
const Trip = require('./travlr');

// read seed data 
const fs = require('fs');
const tripsData = JSON.parse(fs.readFileSync('./college/cs465/app_server/data/trips.json', 'utf8'));


// delete any existing records in the database and seed with new data
const seedDatabase = async () => {
    await Trip.deleteMany({});
    await Trip.insertMany(tripsData);
}

// execute and close connection after completed
seedDatabase().then(() => {
    Mongoose.connection.close();
    console.log('Database seeded successfully');
});