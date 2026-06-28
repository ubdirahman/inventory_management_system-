const express = require('express');
const router = express.Router();
const { paySale, payDebt, payCustomer } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/payments/sale        → Pay for a sale via WaafiPay
router.post('/sale', protect, paySale);

// POST /api/payments/debt/:id    → Pay a debt (partial or full) via WaafiPay
router.post('/debt/:id', protect, payDebt);

// POST /api/payments/customer/:id → Ad-hoc payment from customer via WaafiPay
router.post('/customer/:id', protect, payCustomer);

module.exports = router;
