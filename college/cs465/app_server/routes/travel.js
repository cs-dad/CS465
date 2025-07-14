const express = require('express');

const router = express.Router();

const travelController = require('../controllers/travel');

// /travel
router.get('/', travelController.travel);

module.exports = router;