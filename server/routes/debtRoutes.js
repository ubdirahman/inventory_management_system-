const express = require('express');
const router = express.Router(); // Waddooyinka Deynta
const { getDebts, createDebt, updateDebtStatus, deleteDebt, updateDebt } = require('../controllers/debtController');
const { protect } = require('../middleware/authMiddleware');

const { validate, debtSchema, debtUpdateSchema } = require('../middleware/validation'); // Hubinta xogta

router.route('/')
    .get(protect, getDebts) // Soo qaado dhammaan deynta jista
    .post(protect, validate(debtSchema), createDebt); // Abuur deyn cusub

router.route('/:id')
    .put(protect, validate(debtUpdateSchema), updateDebt) // Wax ka bedel deynta (lacag bixin ama xog bedel)
    .delete(protect, deleteDebt); // Tirtir deynta

module.exports = router;
