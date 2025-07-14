// import necessary modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const vhost = require('vhost');

// load env variables
require('dotenv').config();

// create an express application
const app = express();

// use cors middleware, restricting on production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://csdad.us/' : '*'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// import and use routes
const projects = require('./routes/projects');
const blogs = require('./routes/blogs');

// import other middleware
const redirect404 = require('./middleware/404rdr');


// subdomain handling, allowing me to host multiple subdomains under the same express app

const cs465Setup = require('./college/cs465/cs465setup');


// use vhost to host the subdomain
app.use(vhost('cs465.csdad.us', cs465Setup()));

// static file hosting
app.use(express.static(path.join(__dirname, 'public')));

// legacy method for frontend to check server status, going to keep it here for now.
app.get('/api/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: `Server is running in ${process.env.NODE_ENV} mode.`,
        env: process.env.NODE_ENV
    });
});



app.use('/api/projects', projects.router);
app.use('/api/blogs', blogs);

// https // http server setup
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const HTTP_PORT = process.env.HTTP_PORT || 80;
const CERT_PATH = process.env.CERT_PATH || './ssl';



app.get('/', (req, res) => {
  res.redirect('/index.html'); // redirect to index.html
});

// server project page if valid id exists
app.get('/project/:id', async (req, res) => {
  // get the project id from the request parameters
  const projectId = req.params.id;

  try {
    const exists = await projects.checkIfExists(projectId); // utilize helper function to check if the project exists

    // send the dynamic project page if it exists, otherwise send a 404 error
    if (exists) {
      res.sendFile(path.join(__dirname, 'dynamic', 'project.html'));
    } else {
      res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
  } catch (err) {
    console.error('Error checking project existence:', err); 
    res.json({success: false, message: 'Error checking project existence.'});
  }

});

const initHTTPS = () => {

    const sslOptions = { 
        key: fs.readFileSync(path.join(CERT_PATH, 'csdad.us-key.pem')),
        cert: fs.readFileSync(path.join(CERT_PATH, 'csdad.us-crt.pem')),
        passphrase: process.env.SSL_PASSPHRASE || 'none' // option to add passphrase to decrypt the key
    }

    // create the https server
    const httpsServer = https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
        console.log(`Secure server started on port ${HTTPS_PORT}.`);
    });

    // create an http fallback that will redirect back to https
    http.createServer((req, res) => {
        const host = req.headers.host.split(':')[0]; // get the host
        res.writeHead(301, { "Location": `https://${host}${req.url}` });
        res.end();
    }).listen(HTTP_PORT, () => {
        console.log(`HTTP server started on port ${HTTP_PORT}.`);
    });

};

const initDevHttp = () => {
    // create a default http server for development

    app.listen(HTTP_PORT, () => {
        console.log(`Development server started on port ${HTTP_PORT}.`);
    });
}

const init = () => {
    app.use(redirect404); // use the 404 redirect middleware, we place it at the end so it's the last called middleware

    if (process.env.NODE_ENV === 'production') {
        initHTTPS();
        initDevHttp(); // will also start the fallback http server to allow for redirects or unsecured access
    } else {
        initDevHttp(); // don't init the https server in dev because it can mess with cors policies
    }
}

// init the server
init();