const express = require('express');
const router = express.Router(); // Samaynta waddooyinka maamulka
const { getAdminStats, getUsers, deleteUser, toggleUserBlock, updateUserPassword, registerUserByAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware'); // Hubinta amniga iyo maamulka

// Waddada lagu arko warbixinta guud ee maamulka (Stats)
router.get('/stats', protect, admin, getAdminStats);

// Waddada uu maamuluhu ku diwaangeliyo isticmaale cusub
router.post('/register', protect, admin, registerUserByAdmin);

// Waddada lagu arko dhammaan isticmaalaha nidaamka (Users)
router.get('/users', protect, admin, getUsers);

// Waddada isticmaalaha lagu tirtiro
router.delete('/users/:id', protect, admin, deleteUser);

// Waddada isticmaalaha looga xiro nidaamka (Block/Unblock)
router.put('/users/:id/block', protect, admin, toggleUserBlock);

// Waddada password-ka looga bedelo isticmaalaha
router.put('/users/:id/password', protect, admin, updateUserPassword);

module.exports = router;
