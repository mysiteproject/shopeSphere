const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmail, orderConfirmationEmail } = require('../utils/email');

const TAX_RATE = 0.18; // 18% GST

const calcShipping = (method, total) => {
  if (total >= 999) return 0; // Free shipping above ₹999
  const rates = { standard: 49, express: 99, overnight: 199 };
  return rates[method] || 49;
};

// Create Order
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod, shippingMethod, couponCode, notes } =
    req.body;

  if (!orderItems || orderItems.length === 0) {
    return next(new AppError('No order items', 400));
  }

  // Verify stock and prices
  let itemsPrice = 0;
  const verifiedItems = [];
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) return next(new AppError(`Product ${item.product} not found`, 404));
    if (product.stock < item.quantity) {
      return next(new AppError(`${product.name} is out of stock`, 400));
    }

    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    });
    itemsPrice += product.price * item.quantity;
  }

  const shippingPrice = calcShipping(shippingMethod, itemsPrice);
  const taxPrice = Math.round(itemsPrice * TAX_RATE);
  let discountAmount = 0;
  let couponData = {};

  // Apply coupon
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validation = coupon.isValid(req.user._id, itemsPrice);
      if (validation.valid) {
        discountAmount = coupon.calculateDiscount(itemsPrice);
        couponData = { code: coupon.code, discount: discountAmount };
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
  }

  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

  const order = await Order.create({
    user: req.user._id,
    orderItems: verifiedItems,
    shippingAddress,
    paymentMethod,
    shippingMethod: shippingMethod || 'standard',
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    coupon: couponData,
    notes,
    isPaid: paymentMethod === 'cod' ? false : false,
    statusHistory: [{ status: 'processing', note: 'Order placed' }],
    estimatedDelivery: new Date(
      Date.now() +
        (shippingMethod === 'overnight' ? 1 : shippingMethod === 'express' ? 3 : 7) *
          24 * 60 * 60 * 1000
    ),
  });

  // Reduce stock
  for (const item of verifiedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndDelete({ user: req.user._id });

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `ShopSphere Order Confirmation - ${order.invoiceNumber}`,
      html: orderConfirmationEmail(order),
    });
  } catch {
    // Non-critical, continue
  }

  // Emit real-time update
  try {
    const { getIO } = require('../config/socket');
    getIO().emit('new_order', { orderId: order._id, userId: req.user._id });
  } catch {
    // Socket not initialized
  }

  res.status(201).json({ success: true, order });
});

// Get My Orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

// Get Single Order
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) return next(new AppError('Order not found', 404));
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized', 403));
  }

  res.status(200).json({ success: true, order });
});

// Cancel Order
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  if (['delivered', 'cancelled'].includes(order.orderStatus)) {
    return next(new AppError('Cannot cancel this order', 400));
  }

  // Restore stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by user' });
  await order.save();

  res.status(200).json({ success: true, order });
});

// Track Order
exports.trackOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).select(
    'orderStatus statusHistory trackingNumber estimatedDelivery shippingMethod'
  );
  if (!order) return next(new AppError('Order not found', 404));
  res.status(200).json({ success: true, tracking: order });
});
