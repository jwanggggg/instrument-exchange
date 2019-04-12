const express = require('express');
const router = express.Router();
const Instrument = require('../db').Instrument;
const Studio = require('../db').Studio;
const InstrumentListing = require('../db').InstrumentListing;
const StudioListing = require('../db').StudioListing;
const api = require('../api_keys').zipAPI;
const request = require('request');

// authenticated route
router.get('/studio_listings_buyer', function (req, res) {
    if (req.user) {
        StudioListing.find({sellerId: {$ne: req.user._id}})
            // getting all the studio ids from the studio listings schema
            // that do not include this user's id.
            .then(listings =>{
                const ids = listings.map(ele => {
                    return ele.studioId;
                });
                Studio.find({_id: {$in: ids}})
                    .then(studios => {
                        res.render("studio_listings_buyer", {studios: studios})
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
    else res.render("login_required");
});

// authenticated route
router.get('/instrument_listings_buyer', function (req, res) {
    if (req.user) {
        InstrumentListing.find({sellerId: {$ne: req.user._id}})
        // getting all the instrument ids from the instrument listings schema
        // that do not include this user's id.
            .then(listings =>{
                const ids = listings.map(ele => {
                    return ele.instrumentId;
                });
                Instrument.find({_id: {$in: ids}})
                    .then(instruments => {
                        res.render("instrument_listings_buyer", {instruments: instruments})
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
    else res.render("login_required");
});

// authenticated route
router.get("/studio_detail/:role/:id", function(req, res) {
    if (req.user) {
        const studioId = req.params.id;
        const buyer = req.params.role === "buyer";
        Studio.findOne({"_id": studioId})
            .then(studio => {
                res.render("studio_detail", {studio: studio, buyer: buyer});
            })
            .catch(err => console.log(err));
    }  else res.render("login_required");
});

//authenticated route
router.get("/instrument_detail/:role/:id", function(req, res) {
    if (req.user) {
        const instrumentId = req.params.id;
        const buyer = req.params.role === "buyer";
        Instrument.findOne({"_id": instrumentId})
            .then(instrument => {
                res.render("instrument_detail", {instrument: instrument, buyer: buyer});
            })
            .catch(err => console.log(err));
    }  else res.render("login_required");
});


// for location service and price sorting
router.get('/studios/applyfilter', function(req, res) {
    if (req.user) {
        const distance = req.query.zip_slider;
        const price = req.query.sort_price;
        const userZip = req.user.zip;
        // creating the request url for zip api.
        const url = `https://www.zipcodeapi.com/rest/${api}/radius.json/${userZip}/${distance}/mile`;
        console.log(url);
        request(url, {json: true}, (err, response, body) => {
            if (err) console.log(err);
            zipCodes = body.zip_codes.map(function(ele) {
                return ele.zip_code;
            });
            console.log('list of zip codes found by API:', zipCodes);
            Studio.find({zip: {$in: zipCodes}})
                .then( studios => {
                    res.render("studio_listings_buyer", {studios: studios, sliderValue: distance});
                })
                .catch(err => console.log(err));
        });
    } else res.render("login_required");
});


module.exports = router;