const express = require('express');
const router = express.Router(); // Waddooyinka Macmiilka
const { getCustomers, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

const { validate, customerSchema } = require('../middleware/validation'); // Hubinta xogta

router.route('/')
    .get(protect, getCustomers) // Soo qaado dhammaan macaamiisha
    .post(protect, validate(customerSchema), createCustomer); // Abuur macmiil cusub

router.route('/:id')
    .put(protect, validate(customerSchema), updateCustomer) // Wax ka bedel macmiil jira
    .delete(protect, deleteCustomer); // Tirtir macmiil

module.exports = router;
