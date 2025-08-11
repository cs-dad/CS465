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

// POST: /trips/add - adds a new trip
const addNewTrip = async(req, res) => {
    const newTrip = new Trip({
        code: req.body.code,
        name: req.body.name,
        length: req.body.length,
        start: req.body.start,
        resort: req.body.resort,
        perPerson: req.body.perPerson,
        image: req.body.image,
        description: req.body.description
    })

    const query = await newTrip.save(); // save the new trip

    // validate data, if no data send a 404 response
    if(!query) {
        return res.status(400).json({message: "Failed to add new trip."});
    } else {
        return res.status(201).json(query);
    }
}

// PUT: /trips/:tripCode - updates an existing trip
const updateTrip = async(req, res) => {

    let trip = {
        code: req.body.code,
        name: req.body.name,
        length: req.body.length,
        start: req.body.start,
        resort: req.body.resort,
        perPerson: req.body.perPerson,
        image: req.body.image,
        description: req.body.description
    }

    console.log(trip);


    console.log(req.params.tripCode);
    
    const q = await Trip.findOneAndUpdate({'code': req.params.tripCode}, trip)
    .exec();

    if(!q) {
        return res.status(400).json({message: "Failed to update trip."});
    } else {
        return res.status(200).json(q);
    }


}


module.exports = {
    tripList,
    findTripByCode,
    addNewTrip,
    updateTrip
};