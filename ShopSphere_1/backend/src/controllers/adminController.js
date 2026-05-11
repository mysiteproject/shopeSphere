const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Dashboard Stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalUsers, totalRevenue] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  const recentOrders = await Order.find()
    .sort('-createdAt')
    .limit(10)
    .populate('user', 'name email');

  const monthlyRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  const categoryStats = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
    { $sort: { count: -1 } },
  ]);

  const orderStatusStats = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  const lowStockProducts = await Product.find({ stock: { $lte: 10 }, isActive: true })
    .sort('stock')
    .limit(20)
    .select('name stock price category images');

  res.status(200).json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      monthlyRevenue,
      categoryStats,
      orderStatusStats,
      lowStockProducts,
    },
  });
});

// Admin: Get All Users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find().sort('-createdAt').skip(skip).limit(limit);
  const total = await User.countDocuments();

  res.status(200).json({ success: true, users, page, totalPages: Math.ceil(total / limit), total });
});

// Admin: Update User Role
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role, isActive: req.body.isActive },
    { new: true, runValidators: true }
  );
  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({ success: true, user });
});

// Admin: Delete User
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({ success: true, message: 'User deleted' });
});

// Admin: Get All Orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.status) filter.orderStatus = req.query.status;

  const orders = await Order.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');

  const total = await Order.countDocuments(filter);

  res.status(200).json({ success: true, orders, page, totalPages: Math.ceil(total / limit), total });
});

// Admin: Update Order Status
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  const { status, trackingNumber, note } = req.body;

  if (order.orderStatus === 'delivered') {
    return next(new AppError('Order already delivered', 400));
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Updated to ${status}` });

  if (trackingNumber) order.trackingNumber = trackingNumber;

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }

  await order.save();

  // Emit real-time update
  try {
    const { getIO } = require('../config/socket');
    getIO().to(`order_${order._id}`).emit('order_updated', order);
  } catch {
    // Socket not initialized
  }

  res.status(200).json({ success: true, order });
});

// Sales Analytics
exports.getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = parseInt(period) || 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const dailySales = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, isPaid: true } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
        items: { $sum: { $size: '$orderItems' } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({ success: true, dailySales, topProducts });
});
