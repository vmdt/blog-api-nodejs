const express = require('express');
const passport = require('passport');

const authController = require('../controllers/authController');
require('../config/passport')(passport);

const router = express.Router();

router.get('/google', 
    passport.authenticate('google', { scope: ['profile','email'] })
);

router.get('/google/callback',
    passport.authenticate('google'),
    authController.loginGoogle
);

module.exports = router;
