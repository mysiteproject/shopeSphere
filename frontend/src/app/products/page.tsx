'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, fetchCategories, fetchBrands } from '@/store/slices/productSlice';
import ProductCard from '@/components/ui/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

const sortOptions = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratings' },
  { label: 'Most Reviewed', value: '-numReviews' },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sort, setSort] = useState('-createdAt');

  const dispatch = useAppDispatch();
  const { products, totalProducts, totalPages, page, loading, categories, brands } =
    useAppSelector((state) => state.product);
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = searchParams.get('keyword') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (categoryParam) setSelectedCategories([categoryParam]);
  }, [categoryParam]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (selectedCategories.length) params.set('category', selectedCategories.join(','));
    if (selectedBrands.length) params.set('brand', selectedBrands.join(','));
    if (priceRange[0] > 0) params.set('price[gte]', priceRange[0].toString());
    if (priceRange[1] < 100000) params.set('price[lte]', priceRange[1].toString());
    params.set('sort', sort);
    params.set('page', (searchParams.get('page') || '1'));

    dispatch(fetchProducts(params.toString()));
  }, [dispatch, keyword, selectedCategories, selectedBrands, priceRange, sort, searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 100000]);
    setSort('-createdAt');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {keyword ? `Results for "${keyword}"` : 'All Products'}
          </h1>
          <p className="text-slate-500 mt-1">{totalProducts} products found</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn-secondary !py-2.5 flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4" /><span>Filters</span>
          </button>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field !py-2.5 pr-10 appearance-none cursor-pointer text-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
          <div className={`${showFilters ? 'absolute right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 p-6 overflow-y-auto shadow-2xl' : ''} lg:relative lg:w-full lg:shadow-none lg:p-0`}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 mb-4 font-medium">
                Clear All Filters
              </button>
            )}

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Brands</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="input-field !py-2 text-sm"
                  placeholder="Min"
                  min={0}
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="input-field !py-2 text-sm"
                  placeholder="Max"
                  min={0}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-slate-400 mb-4">No products found</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
