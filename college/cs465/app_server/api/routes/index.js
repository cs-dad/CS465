const express = require('express');
const router = express.Router();

const tripsController = require('../controllers/trips');

router.route("/trips").get(tripsController.tripList);

router.route("/trips/:code").get(tripsController.findTripByCode);

module.exports = router;