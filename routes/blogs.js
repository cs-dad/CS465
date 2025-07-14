const express = require('express');
const router = express.Router();

// import nedb
const Datastore = require('nedb');

// uuid for unique ids
const { v4: uuidv4 } = require('uuid');

// auth middleware
const authKey = require('../middleware/authKey');

// get the blogs db
const blogsDb = new Datastore({
    filename: './data/blogs.db',
    autoload: true
});

// base get route
router.get('/', (req, res) => {

    // find all documents
    blogsDb.find({}, (err, blogs) => {
        if(err) return res.status(500).json({ success: false, message: 'Error retrieving blogs.' });

        res.status(200).json({
            success: true,
            data: blogs
        });
    
    });

});

// base post route
router.post('/', authKey, (req, res) => {
    // get the blog data from the request body
    const { title, content, author, image } = req.body;

    // validate the data
    if(!title || !content || !author || !image) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // create a blog object
    const blog = {
        id: uuidv4(), // generate a unique id
        title,
        content,
        author,
        image,
        createdAt: new Date() // add a createdAt timestamp
    };

    // insert the blog into the database
    blogsDb.insert(blog, (err, newDoc) => {
        if(err) return res.status(500).json({ success: false, message: 'Error creating blog.' });

        res.status(201).json({
            success: true,
            data: newDoc
        });
    
    });

});

// export the router
module.exports = router;;