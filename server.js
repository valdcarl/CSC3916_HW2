/*
 * CSC3916 HW2
 * File: Server.js
 * Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();    // have an express server
app.use(cors());        // use middleware 'cors' that will allow browser to call me
app.use(bodyParser.json())  // use a json parser to not do JSON.parse each time on the body
app.use(bodyParser.urlencoded({ extended: false }));    // allow it on the url

app.use(passport.initialize()); //handle basic auth and jwt authentication for us

var router = express.Router();  //to do get requests and things like that

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body !== null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', function(req, res) {
    var user = db.findOne(req.body.username);   // find user in the database

    if (!user) {  // if I don't have a user
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {      // we found the user
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only

