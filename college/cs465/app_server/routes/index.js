// import necessary modules
const express = require('express');
const router = express.Router();

// our main controller
const mainController = require('../controllers/main');

/* GET home page for CS465 */
router.get('/', mainController.index);



module.exports = router;