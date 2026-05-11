'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductBySlug, addReview } from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/authSlice';
import ProductCard from '@/components/ui/ProductCard';
import RatingStars from '@/components/ui/RatingStars';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { product, relatedProducts, loading } = useAppSelector((state) => state.product);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (slug) dispatch(fetchProductBySlug(slug as string));
  }, [dispatch, slug]);

  useEffect(() => {
    if (product) {
      if (product.colors?.length) setSelectedColor(product.colors[0]);
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ productId: product._id, quantity, color: selectedColor, size: selectedSize }));
    toast.success('Added to cart!');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (product) dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const result = await dispatch(addReview({ id: product._id, data: { rating: reviewRating, comment: reviewComment } }));
    if (addReview.fulfilled.match(result)) {
      toast.success('Review submitted!');
      setReviewComment('');
      setShowReviewForm(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading product..." />;
  if (!product) return <div className="text-center py-20 text-slate-500">Product not found</div>;

  const isWishlisted = user?.wishlist?.includes(product._id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800"
          >
            <img
              src={product.images[selectedImage]?.url || '/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === selectedImage ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <span className="text-sm text-primary-600 font-medium">{product.brand}</span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center space-x-3 mb-4">
            <RatingStars rating={product.ratings} />
            <span className="text-sm text-slate-500">{product.ratings.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl font-bold text-primary-600">₹{product.price.toLocaleString()}</span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-slate-400 line-through">₹{product.comparePrice.toLocaleString()}</span>
                <span className="badge-green text-sm font-bold">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {product.shortDescription || product.description.slice(0, 300)}
          </p>

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Color: <span className="text-primary-600">{selectedColor}</span></h3>
              <div className="flex space-x-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      selectedColor === color ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'hover:border-slate-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Size: <span className="text-primary-600">{selectedSize}</span></h3>
              <div className="flex space-x-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl border text-sm font-medium transition-colors ${
                      selectedSize === size ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Actions */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border rounded-xl">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-xl">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-xl">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-slate-500">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>

          <div className="flex space-x-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-xl border-2 transition-colors ${
                isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-slate-300 hover:border-red-300'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: 'Free Shipping' },
              { icon: Shield, text: 'Warranty' },
              { icon: RotateCcw, text: 'Easy Returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <Icon className="w-5 h-5 text-primary-600 mb-1" />
                <span className="text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description + Reviews */}
      <div className="mt-16">
        <div className="border-b dark:border-slate-700 mb-8">
          <h2 className="text-xl font-bold pb-4">Description</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line mb-12">
          {product.description}
        </p>

        {/* Reviews Section */}
        <div className="border-b dark:border-slate-700 mb-8">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-xl font-bold">Reviews ({product.numReviews})</h2>
            {isAuthenticated && (
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-outline !py-2 text-sm">
                Write Review
              </button>
            )}
          </div>
        </div>

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="card p-6 mb-8">
            <h3 className="font-semibold mb-4">Your Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <RatingStars rating={reviewRating} interactive onChange={setReviewRating} size="lg" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="input-field h-24 resize-none"
                placeholder="Share your thoughts..."
                required
              />
            </div>
            <button type="submit" className="btn-primary text-sm">Submit Review</button>
          </form>
        )}

        <div className="space-y-6">
          {product.reviews.map((review) => (
            <div key={review._id} className="flex space-x-4 pb-6 border-b dark:border-slate-700 last:border-0">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary-600">{review.name.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">{review.name}</span>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{review.comment}</p>
                <span className="text-xs text-slate-400 mt-1 block">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {product.reviews.length === 0 && (
            <p className="text-center text-slate-400 py-8">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.slice(0, 4).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
