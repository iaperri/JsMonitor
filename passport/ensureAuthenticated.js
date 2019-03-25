"use strict";
function ensureAuthenticated(req,res,next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('error', 'You must be logged in to do that.');
    res.redirect('/');
  }
}

module.exports = ensureAuthenticated
