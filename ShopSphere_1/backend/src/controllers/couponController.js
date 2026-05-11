const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Apply Coupon
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { code, cartTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return next(new AppError('Invalid coupon code', 404));

  const validation = coupon.isValid(req.user._id, cartTotal);
  if (!validation.valid) return next(new AppError(validation.message, 400));

  const discount = coupon.calculateDiscount(cartTotal);

  res.status(200).json({
    success: true,
    coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
    discount,
    finalTotal: cartTotal - discount,
  });
});

// Admin: Get All Coupons
exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.status(200).json({ success: true, coupons });
});

// Admin: Create Coupon
exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

// Admin: Update Coupon
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) return next(new AppError('Coupon not found', 404));
  res.status(200).json({ success: true, coupon });
});

// Admin: Delete Coupon
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));
  res.status(200).json({ success: true, message: 'Coupon deleted' });
});
