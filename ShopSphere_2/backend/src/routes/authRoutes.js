const express = require('express');
const router = express.Router();
const {
  register, login, googleLogin, logout, refreshToken,
  forgotPassword, resetPassword, getProfile, updateProfile,
  updatePassword, manageAddress, deleteAddress, toggleWishlist,
  getWishlist, updateAvatar,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleLogin);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);

router.post('/address', protect, manageAddress);
router.delete('/address/:addressId', protect, deleteAddress);

router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

module.exports = router;
