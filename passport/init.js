"use strict";
var login = require('./login'),
    db = require('../lib/mongo.js');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        // console.log('serializing user: ');
        // console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
      	db.findOne('users',{'_id':db.objectId(id)}, function(err, user) {
        // User.findById(id, function(err, user) {
            // console.log('deserializing user:',user);
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    // signup(passport);

}
