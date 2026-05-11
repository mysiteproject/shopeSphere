const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const ApiFeatures = require('../utils/ApiFeatures');
const cloudinary = require('../config/cloudinary');

// Get All Products
exports.getProducts = asyncHandler(async (req, res) => {
  const resultPerPage = 12;
  const totalProducts = await Product.countDocuments({ isActive: true });

  const apiFeatures = new ApiFeatures(Product.find({ isActive: true }), req.query)
    .search()
    .filter()
    .sort()
    .paginate(resultPerPage);

  const products = await apiFeatures.query;
  const page = parseInt(req.query.page, 10) || 1;
  const totalPages = Math.ceil(totalProducts / (parseInt(req.query.limit, 10) || resultPerPage));

  res.status(200).json({
    success: true,
    products,
    totalProducts,
    page,
    totalPages,
    resultPerPage,
  });
});

// Get Single Product
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
  if (!product) return next(new AppError('Product not found', 404));
  res.status(200).json({ success: true, product });
});

// Get Product by Slug
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    'reviews.user',
    'name avatar'
  );
  if (!product) return next(new AppError('Product not found', 404));

  // Get related products
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(8);

  res.status(200).json({ success: true, product, relatedProducts: related });
});

// Create Product (Admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const images = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'shopsphere/products',
      });
      images.push({ public_id: result.public_id, url: result.secure_url });
    }
  }

  const product = await Product.create({
    ...req.body,
    images: images.length > 0 ? images : req.body.images,
    vendor: req.user._id,
    colors: req.body.colors ? JSON.parse(req.body.colors) : [],
    sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
    tags: req.body.tags ? JSON.parse(req.body.tags) : [],
  });

  res.status(201).json({ success: true, product });
});

// Update Product (Admin)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  // Handle new images
  if (req.files && req.files.length > 0) {
    // Delete old images
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    const images = [];
    for (const file of req.files) {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'shopsphere/products',
      });
      images.push({ public_id: result.public_id, url: result.secure_url });
    }
    req.body.images = images;
  }

  if (req.body.colors && typeof req.body.colors === 'string') {
    req.body.colors = JSON.parse(req.body.colors);
  }
  if (req.body.sizes && typeof req.body.sizes === 'string') {
    req.body.sizes = JSON.parse(req.body.sizes);
  }
  if (req.body.tags && typeof req.body.tags === 'string') {
    req.body.tags = JSON.parse(req.body.tags);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, product });
});

// Delete Product (Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  for (const img of product.images) {
    if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted' });
});

// Add Review
exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  const existingReview = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar?.url,
      rating,
      comment,
    });
  }

  product.numReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(200).json({ success: true, product });
});

// Delete Review
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  product.reviews = product.reviews.filter(
    (r) => r._id.toString() !== req.query.reviewId
  );

  product.numReviews = product.reviews.length;
  product.ratings =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0;

  await product.save();
  res.status(200).json({ success: true, product });
});

// Get Categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.status(200).json({ success: true, categories });
});

// Get Brands
exports.getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand', { isActive: true });
  res.status(200).json({ success: true, brands });
});

// Get Featured Products
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(12);
  res.status(200).json({ success: true, products });
});

// AI Recommendations (simple collaborative filtering)
exports.getRecommendations = asyncHandler(async (req, res) => {
  const { category, productId } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (productId) filter._id = { $ne: productId };

  const products = await Product.find(filter)
    .sort({ ratings: -1, numReviews: -1 })
    .limit(12);

  res.status(200).json({ success: true, products });
});
