const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
  
  res.redirect('http://localhost:3000/TituladosHome');

});



module.exports = router;

