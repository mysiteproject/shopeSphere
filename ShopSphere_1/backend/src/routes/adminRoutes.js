const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, updateUserRole, deleteUser,
  getAllOrders, updateOrderStatus, getSalesAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getSalesAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
