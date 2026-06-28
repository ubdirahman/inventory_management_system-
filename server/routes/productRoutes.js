const express = require('express');
const router = express.Router(); // Waddooyinka Alaabta (Products)
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const { validate, productSchema } = require('../middleware/validation'); // Hubinta xogta

router.route('/')
    .get(protect, getProducts) // Soo qaado dhammaan alaabta bakhaarka
    .post(protect, validate(productSchema), createProduct); // Soo gali alaab cusub

router.route('/:id')
    .put(protect, validate(productSchema), updateProduct) // Wax ka bedel alaabta (qiimaha ama tirada)
    .delete(protect, deleteProduct); // Alaabta tirtir

module.exports = router;
