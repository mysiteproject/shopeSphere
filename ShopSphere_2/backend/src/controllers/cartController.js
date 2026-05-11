const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getCartQuery = (req) => {
  if (req.user) return { user: req.user._id };
  if (req.cookies?.sessionId) return { sessionId: req.cookies.sessionId };
  return null;
};

// Get Cart
exports.getCart = asyncHandler(async (req, res) => {
  const query = getCartQuery(req);
  if (!query) return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });

  const cart = await Cart.findOne(query).populate('items.product', 'name images price stock slug');
  res.status(200).json({ success: true, cart: cart || { items: [], totalPrice: 0, totalItems: 0 } });
});

// Add to Cart
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, color, size } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));
  if (product.stock < quantity) return next(new AppError('Insufficient stock', 400));

  let query = getCartQuery(req);
  if (!query) {
    const { v4: uuidv4 } = require('uuid');
    const sessionId = uuidv4();
    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    query = { sessionId };
  }

  let cart = await Cart.findOne(query);
  if (!cart) {
    cart = new Cart({ ...query, items: [] });
  }

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.color === (color || '') &&
      item.size === (size || '')
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, price: product.price, color, size });
  }

  await cart.save();
  await cart.populate('items.product', 'name images price stock slug');
  res.status(200).json({ success: true, cart });
});

// Update Cart Item Quantity
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const query = getCartQuery(req);
  if (!query) return next(new AppError('Cart not found', 404));

  const cart = await Cart.findOne(query);
  if (!cart) return next(new AppError('Cart not found', 404));

  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Item not found in cart', 404));

  const product = await Product.findById(item.product);
  if (quantity > product.stock) return next(new AppError('Insufficient stock', 400));

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name images price stock slug');
  res.status(200).json({ success: true, cart });
});

// Remove from Cart
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const query = getCartQuery(req);
  if (!query) return next(new AppError('Cart not found', 404));

  const cart = await Cart.findOne(query);
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
  await cart.save();
  await cart.populate('items.product', 'name images price stock slug');
  res.status(200).json({ success: true, cart });
});

// Clear Cart
exports.clearCart = asyncHandler(async (req, res) => {
  const query = getCartQuery(req);
  if (query) await Cart.findOneAndDelete(query);
  res.status(200).json({ success: true, message: 'Cart cleared' });
});

// Merge guest cart with user cart (after login)
exports.mergeCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(200).json({ success: true, message: 'No guest cart' });

  const guestCart = await Cart.findOne({ sessionId });
  if (!guestCart) return res.status(200).json({ success: true, message: 'No guest cart' });

  let userCart = await Cart.findOne({ user: req.user._id });
  if (!userCart) {
    userCart = new Cart({ user: req.user._id, items: [] });
  }

  for (const guestItem of guestCart.items) {
    const existing = userCart.items.find(
      (item) => item.product.toString() === guestItem.product.toString()
    );
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      userCart.items.push(guestItem);
    }
  }

  await userCart.save();
  await guestCart.deleteOne();
  await userCart.populate('items.product', 'name images price stock slug');

  res.status(200).json({ success: true, cart: userCart });
});
