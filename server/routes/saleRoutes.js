const express = require('express');
const router = express.Router(); // Waddooyinka Iibka
const { getSales, createSale, deleteSale, updateSale } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

const { validate, saleSchema } = require('../middleware/validation'); // Hubinta xogta

router.route('/')
    .get(protect, getSales) // Soo qaado dhammaan wixii la iibiyey kalfadhigan
    .post(protect, validate(saleSchema), createSale); // Samee iib cusub

router.route('/:id')
    .delete(protect, deleteSale) // Tirtir iib (haddii qalad dhacay)
    .put(protect, validate(saleSchema), updateSale); // Wax ka bedel iibka

module.exports = router;
