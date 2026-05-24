const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  getBDAs,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getUserProfile);
router.get('/bdas', protect, getBDAs);

module.exports = router;
