"use strict";
// var LocalStrategy   = require('passport-local').Strategy;
// var bCrypt = require('bcrypt-nodejs');

// module.exports = function(req, res) {
// 						var username = req.body.username,
// 								password = createHash(req.body.password),
// 								group = req.body.group;
//             findOrCreateUser = function(){
//                 // find a user in Mongo with provided username
//               db.findOne(group, {'username':username}, function(err, user) {
//                     // In case of any error, return using the done method
//                     if (err){
//                         console.log('Error in SignUp: '+err);
//                         return done(err);
//                     }
//                     // already exists
//                     if (user) {
//                         console.log('User already exists with username: '+username);
//                         return done(null, false, req.flash('message','User Already Exists'));
//                     } else {
//                         //TODO
//                     }
//                 });
//             };
//             // Delay the execution of findOrCreateUser and execute the method
//             // in the next tick of the event loop
//             process.nextTick(findOrCreateUser);
//         })
//     );
var bCrypt = require('bcrypt-nodejs');
// Generates hash using bCrypt
var createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};
console.log(`hash of GarysSocialites ${createHash('GarysSocialites')}`);
// }