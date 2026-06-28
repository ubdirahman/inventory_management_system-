const express = require('express');
const router = express.Router(); // Samaynta Router-ka (Waddooyinka)
const { loginUser, registerUser } = require('../controllers/authController'); // Keento Controller-ka

// Keento hubinta (Validation)
const { validate, registerSchema, loginSchema } = require('../middleware/validation');

// Waddooyinka (Routes)
router.post('/login', validate(loginSchema), loginUser); // Waddada login-ka
// router.post('/register', validate(registerSchema), registerUser); // Waddada is diwaangelinta (hadda waa comment)

module.exports = router;
