const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmail, resetPasswordEmail } = require('../utils/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge,
});

const sendTokens = async (user, statusCode, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  res.status(statusCode).json({ success: true, user: userObj, accessToken });
};

// Register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  const user = await User.create({ name, email, password });
  await sendTokens(user, 201, res);
});

// Login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account deactivated. Contact support.', 403));
  }

  await sendTokens(user, 200, res);
});

// Google Login
exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { credential } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { sub: googleId, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      avatar: { url: picture },
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (!user.avatar?.url || user.avatar.url.includes('default')) {
      user.avatar = { url: picture };
    }
    await user.save({ validateBeforeSave: false });
  }

  await sendTokens(user, 200, res);
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }

  res.cookie('accessToken', '', { ...cookieOptions(0), maxAge: 0 });
  res.cookie('refreshToken', '', { ...cookieOptions(0), maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Refresh Token
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  const jwt = require('jsonwebtoken');
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return next(new AppError('Invalid refresh token', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  const newAccessToken = user.generateAccessToken();
  res.cookie('accessToken', newAccessToken, cookieOptions(15 * 60 * 1000));
  res.status(200).json({ success: true, accessToken: newAccessToken });
});

// Forgot Password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No account with that email', 404));
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'ShopSphere - Password Reset',
      html: resetPasswordEmail(resetUrl),
    });
    res.status(200).json({ success: true, message: 'Reset email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send email', 500));
  }
});

// Reset Password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  await sendTokens(user, 200, res);
});

// Get Profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// Update Profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, preferredLanguage } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (preferredLanguage) updates.preferredLanguage = preferredLanguage;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
});

// Update Password
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  await sendTokens(user, 200, res);
});

// Add/Update Address
exports.manageAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { addressId, ...addressData } = req.body;

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  if (addressId) {
    const idx = user.addresses.findIndex((a) => a._id.toString() === addressId);
    if (idx > -1) user.addresses[idx] = { ...user.addresses[idx].toObject(), ...addressData };
  } else {
    if (user.addresses.length === 0) addressData.isDefault = true;
    user.addresses.push(addressData);
  }

  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// Delete Address
exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// Toggle Wishlist
exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const index = user.wishlist.indexOf(productId);

  if (index > -1) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// Get Wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// Update Avatar
exports.updateAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image', 400));

  const cloudinary = require('../config/cloudinary');

  // Delete old avatar
  if (req.user.avatar?.public_id) {
    await cloudinary.uploader.destroy(req.user.avatar.public_id);
  }

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'shopsphere/avatars',
    width: 200,
    crop: 'scale',
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { public_id: result.public_id, url: result.secure_url } },
    { new: true }
  );

  res.status(200).json({ success: true, user });
});
