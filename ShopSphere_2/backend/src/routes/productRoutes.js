const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getProductBySlug, createProduct,
  updateProduct, deleteProduct, addReview, deleteReview,
  getCategories, getBrands, getFeaturedProducts, getRecommendations,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/featured', getFeaturedProducts);
router.get('/recommendations', getRecommendations);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

router.post('/', protect, authorize('admin', 'vendor'), upload.array('images', 10), validateProduct, createProduct);
router.put('/:id', protect, authorize('admin', 'vendor'), upload.array('images', 10), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews', protect, deleteReview);

module.exports = router;
