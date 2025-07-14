const express = require('express');
const router = express.Router();

// use uuid to generate unique ids for each project
const {
    v4: uuidv4
} = require('uuid');
// import our authKey middleware
const authKey = require('../middleware/authKey');

// we're using nedb, an embdedded database meant to simulate MongoDB
const Datastore = require('nedb');
// get the projects db
const projectsDb = new Datastore({
    filename: './data/projects.db',
    autoload: true
});

// base get route
router.get('/', (req, res) => {

    // find all documents
    projectsDb.find({}, (err, projects) => {
        if (err) return res.status(500).json({
            success: false,
            message: 'Error retrieving projects.'
        });

        res.status(200).json({
            success: true,
            data: projects
        });

    });

});

router.get('/exists/:id', (req, res) => {
    const projectId = req.params.id;
    projectsDb.findOne({ id: projectId }, (err, project) => {
        if (err) return res.status(500).json({
            success: false,
            message: 'Error checking project existence.'
        });
        if (project) {
            return res.status(200).json({
                success: true,
                exists: true
            });
        } else {
            return res.status(404).json({
                success: false,
                exists: false,
                message: 'Project not found.'
            });
        }
    });
});

// Get project by id
router.get('/:id', (req, res) => {
    const project = req.params.id;

    projectsDb.findOne({
        id: project
    }, (err, projectData) => {
        if (err) return res.status(500).json({
            success: false,
            message: 'Error retrieving project.'
        });

        if (!projectData) {
            return res.status(404).json({
                success: false,
                message: 'Project not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: projectData
        });
    });
});

// base post route
router.post('/', authKey, (req, res) => {

    const {
        title,
        description,
        overview,
        features,
        challenges,
        screenshots,
        contributions,
        important_links,
        techStack
    } = req.body;

    // Validate required fields
    if (
        !title || !description || !overview || !features ||
        !challenges || !contributions ||
        !Array.isArray(screenshots) || !Array.isArray(important_links) || !Array.isArray(techStack)
    ) {
        return res.status(400).json({
            success: false,
            message: 'Missing or invalid project fields.'
        });
    }

    // Validate important_links format
    const validLinks = important_links.every(link =>
        typeof link.label === 'string' && typeof link.url === 'string'
    );

    if (!validLinks) {
        return res.status(400).json({
            success: false,
            message: 'Each important link must have a label and url.'
        });
    }

    const project = {
        id: uuidv4(),
        title,
        description,
        overview,
        features,
        challenges,
        screenshots,
        contributions,
        important_links,
        techStack,
        createdAt: new Date()
    };

    projectsDb.insert(project, (err, newDoc) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error creating project.'
            });
        }

        res.status(201).json({
            success: true,
            data: newDoc
        });
    });

});

const checkIfExists = (projectId) => {
  return new Promise((resolve, reject) => {
    projectsDb.findOne({ id: projectId }, (err, project) => {
      if (err) return reject(err);
      resolve(!!project);
    });
  });
};
// export the router
module.exports = { router, checkIfExists };