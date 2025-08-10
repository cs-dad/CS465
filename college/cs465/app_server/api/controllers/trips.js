const mongoose = require('mongoose');
const path = require('path');

// register model
const Trip = require(path.join(__dirname, '../models/travlr'));
const Model = mongoose.model('trips', Trip.schema);


// GET: /trips - lists all of the trips
const tripList = async(req, res) => {
    const query = await Model.find({}) // no filter, returns all records
    .exec(); // execute

    // validate data, if no data send a 404 response
    if(!query) {
        return res.status(404).json({message: "No trips found."});
    } else {
        return res.status(200).json(query);
    }
}

// GET: /trips/:code - gets a trip by its code
const findTripByCode = async(req, res) => {

    const code = req.params.code;
    // in theory this should always be a string, but let's null check for safety
    if(!code) {
        return res.status(400).json({message: "Trip code is required."});
    }

    const query = await Model.findOne({'code': code}) // find one record by code
    .exec(); // execute

    // validate data, if no data send a 404 response
    if(!query) {
        return res.status(404).json({message: "Trip not found."});
    } else {
        return res.status(200).json(query);
    }

}

module.exports = {
    tripList,
    findTripByCode
};