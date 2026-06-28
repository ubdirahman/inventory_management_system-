const express = require('express');
const router = express.Router(); // Waddooyinka Dashboard-ka
const { getUserDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Soo qaado macluumaadka lagu soo bandhigayo Dashboard-ka isticmaalaha
router.get('/', protect, getUserDashboardStats);

module.exports = router;
