import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Product } from '@/types';

interface ProductState {
  products: Product[];
  product: Product | null;
  relatedProducts: Product[];
  featured: Product[];
  categories: string[];
  brands: string[];
  totalProducts: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  product: null,
  relatedProducts: [],
  featured: [],
  categories: [],
  brands: [],
  totalProducts: 0,
  totalPages: 0,
  page: 1,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('product/fetchProducts', async (params: string, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products?${params}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductBySlug = createAsyncThunk('product/fetchBySlug', async (slug: string, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/slug/${slug}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Product not found');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('product/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/featured');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const fetchCategories = createAsyncThunk('product/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/categories');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const fetchBrands = createAsyncThunk('product/fetchBrands', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/brands');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const addReview = createAsyncThunk('product/addReview', async ({ id, data }: { id: string; data: { rating: number; comment: string } }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/products/${id}/reviews`, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProduct: (state) => { state.product = null; state.relatedProducts = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchProductBySlug.pending, (state) => { state.loading = true; })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.product;
        state.relatedProducts = action.payload.relatedProducts || [];
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => { state.featured = action.payload.products; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload.categories; })
      .addCase(fetchBrands.fulfilled, (state, action) => { state.brands = action.payload.brands; })
      .addCase(addReview.fulfilled, (state, action) => { state.product = action.payload.product; });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
