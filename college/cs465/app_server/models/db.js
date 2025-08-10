const mongoose = require('mongoose');

require('dotenv').config();

// Load environment variables from .env file
const host = process.env.DB_HOST || '127.0.0.1';
const user = process.env.DB_USER || 'user';
const pass = process.env.DB_PASS || 'pass';
const authSource = process.env.DB_AUTH_SOURCE || 'admin';
const dbName = process.env.DB_NAME || 'database';

console.log(`Connecting to MongoDB at ${host} with user ${user}...`);
const dbURI = `mongodb://${user}:${pass}@${host}:27017/${dbName}?authSource=${authSource}`;
const readline = require('readline');


// Connect to the MongoDB database
const connect = () => {
    setTimeout(() => {
        mongoose.connect(dbURI, {})
    }, 1000);
}

// monitor connection status and events
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

// windows specific listener
if(process.platform === 'win32') {
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    r1.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    });
}

// configure for graceful shutdown
const gracefulShutdown = (msg) => {
    mongoose.connection.close(() => {
        console.log(`MongoDB connection closed due to ${msg}`);
    });
}

// shut down invoked by nodemon signal
process.on('SIGUSR2', () => {
    gracefulShutdown('nodemon restart');
    process.kill(process.pid, 'SIGUSR2');
});

// Invoked by app term
process.on('SIGINT', () => {
    gracefulShutdown('app termination');
    process.exit(0);
});

// container terminaation
process.on('SIGTERM', () => {
    gracefulShutdown('container termination');
    process.exit(0);
});


// connect to the database
connect();

// import schemas
require ('./travlr');


// export mongoose
module.exports = mongoose;