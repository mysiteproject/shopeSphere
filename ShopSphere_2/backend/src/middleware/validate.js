const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Note: Using manual validation since express-validator is lightweight
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(messages.join('. '), 400));
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Please provide a valid email');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length) return next(new AppError(errors.join('. '), 400));
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Please provide an email');
  if (!password) errors.push('Please provide a password');

  if (errors.length) return next(new AppError(errors.join('. '), 400));
  next();
};

const validateProduct = (req, res, next) => {
  const { name, description, price, category, brand, stock } = req.body;
  const errors = [];

  if (!name) errors.push('Product name is required');
  if (!description) errors.push('Product description is required');
  if (price === undefined || price < 0) errors.push('Valid price is required');
  if (!category) errors.push('Category is required');
  if (!brand) errors.push('Brand is required');
  if (stock === undefined || stock < 0) errors.push('Valid stock is required');

  if (errors.length) return next(new AppError(errors.join('. '), 400));
  next();
};

const validateOrder = (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;
  const errors = [];

  if (!orderItems || !orderItems.length) errors.push('Order must have at least one item');
  if (!shippingAddress) errors.push('Shipping address is required');
  if (!paymentMethod) errors.push('Payment method is required');

  if (errors.length) return next(new AppError(errors.join('. '), 400));
  next();
};

module.exports = { validate, validateRegister, validateLogin, validateProduct, validateOrder };
