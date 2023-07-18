const express = require('express');
const router = express.Router();
const { postSignup } = require('../controllers/signupController');

router.post('/', postSignup);

module.exports = router;