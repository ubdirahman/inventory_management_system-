const { purchase, WaafiPaymentError } = require('../services/waafiPayService');
const Sale = require('../models/Sale');
const Debt = require('../models/Debt');
const Customer = require('../models/Customer');

// @desc   Pay for a sale via WaafiPay
// POST /api/payments/sale
const paySale = async (req, res) => {
    try {
        const { saleId, accountNo, amount, description } = req.body;

        if (!accountNo) {
            return res.status(400).json({ message: 'Phone number (accountNo) is required.' });
        }
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: 'A valid amount is required.' });
        }

        // Optionally validate the sale belongs to this user
        if (saleId) {
            const sale = await Sale.findOne({ _id: saleId, user: req.user._id });
            if (!sale) return res.status(404).json({ message: 'Sale not found.' });
        }

        const result = await purchase({
            accountNo,
            amount: Number(amount),
            description: description || 'Sale Payment',
            referencePrefix: 'SALE'
        });

        res.json({ success: true, message: 'Payment successful via WaafiPay.', data: result });
    } catch (err) {
        if (err instanceof WaafiPaymentError) {
            return res.status(err.statusCode).json({ message: err.message, details: err.details });
        }
        res.status(500).json({ message: 'Server error during payment.', error: err.message });
    }
};

// @desc   Pay for a debt via WaafiPay (partial or full)
// POST /api/payments/debt/:id
const payDebt = async (req, res) => {
    try {
        const { accountNo, amount } = req.body;
        const debt = await Debt.findOne({ _id: req.params.id, user: req.user._id })
            .populate('customer', 'customer_name phone')
            .populate('product', 'name');

        if (!debt) return res.status(404).json({ message: 'Debt not found.' });

        const total = debt.quantity * debt.price;
        const alreadyPaid = debt.paidAmount || 0;
        const remaining = total - alreadyPaid;

        if (remaining <= 0) {
            return res.status(400).json({ message: 'This debt is already fully paid.' });
        }

        // Use customer phone if not provided
        const phoneToUse = accountNo || debt.customer?.phone;
        if (!phoneToUse) {
            return res.status(400).json({ message: 'Customer phone number is required.' });
        }

        const payAmount = Number(amount) || remaining;
        if (payAmount <= 0) {
            return res.status(400).json({ message: 'A valid payment amount is required.' });
        }

        const result = await purchase({
            accountNo: phoneToUse,
            amount: Math.min(payAmount, remaining), // Cannot overpay
            description: `Debt payment: ${debt.product?.name || 'Product'} for ${debt.customer?.customer_name || 'Customer'}`,
            referencePrefix: 'DEBT'
        });

        // Update the debt record after successful payment
        const newPaidAmount = alreadyPaid + Math.min(payAmount, remaining);
        const newStatus = newPaidAmount >= total ? 'paid' : 'unpaid';
        debt.paidAmount = newPaidAmount;
        debt.status = newStatus;
        await debt.save();

        res.json({
            success: true,
            message: 'Debt payment successful via WaafiPay.',
            data: result,
            debt: {
                paidAmount: newPaidAmount,
                remaining: total - newPaidAmount,
                status: newStatus
            }
        });
    } catch (err) {
        if (err instanceof WaafiPaymentError) {
            return res.status(err.statusCode).json({ message: err.message, details: err.details });
        }
        res.status(500).json({ message: 'Server error during debt payment.', error: err.message });
    }
};

// @desc   Pay a customer (ad-hoc) via WaafiPay
// POST /api/payments/customer/:id
const payCustomer = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });

        if (!customer) return res.status(404).json({ message: 'Customer not found.' });
        if (!customer.phone) return res.status(400).json({ message: 'Customer has no phone number.' });
        if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'A valid amount is required.' });

        const result = await purchase({
            accountNo: customer.phone,
            amount: Number(amount),
            description: description || `Payment from ${customer.customer_name}`,
            referencePrefix: 'CUST'
        });

        res.json({ success: true, message: 'Payment sent successfully via WaafiPay.', data: result });
    } catch (err) {
        if (err instanceof WaafiPaymentError) {
            return res.status(err.statusCode).json({ message: err.message, details: err.details });
        }
        res.status(500).json({ message: 'Server error during payment.', error: err.message });
    }
};

module.exports = { paySale, payDebt, payCustomer };
