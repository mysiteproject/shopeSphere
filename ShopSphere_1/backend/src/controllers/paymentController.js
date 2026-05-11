const Stripe = require('stripe');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Stripe: Create Payment Intent
exports.createStripeIntent = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // Convert to paise/cents
    currency: 'inr',
    metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

// Stripe: Confirm Payment
exports.confirmStripePayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, orderId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== 'succeeded') {
    return next(new AppError('Payment not completed', 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: paymentIntentId,
    status: paymentIntent.status,
    update_time: new Date().toISOString(),
  };
  order.orderStatus = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', note: 'Payment confirmed via Stripe' });
  await order.save();

  res.status(200).json({ success: true, order });
});

// Stripe Webhook
exports.stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.orderStatus = 'confirmed';
        order.statusHistory.push({ status: 'confirmed', note: 'Payment confirmed via Stripe webhook' });
        await order.save();
      }
    }
  }

  res.status(200).json({ received: true });
});

// Razorpay: Create Order
exports.createRazorpayOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalPrice * 100), // Convert to paise
    currency: 'INR',
    receipt: order._id.toString(),
    notes: { orderId: order._id.toString() },
  });

  res.status(200).json({
    success: true,
    razorpayOrder,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// Razorpay: Verify Payment
exports.verifyRazorpayPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return next(new AppError('Payment verification failed', 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    status: 'completed',
  };
  order.orderStatus = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', note: 'Payment confirmed via Razorpay' });
  await order.save();

  res.status(200).json({ success: true, order });
});
