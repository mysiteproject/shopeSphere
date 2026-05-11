import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Cart } from '@/types';

interface CartState {
  cart: Cart;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: { items: [], totalPrice: 0, totalItems: 0 },
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const addToCart = createAsyncThunk('cart/add', async (data: { productId: string; quantity?: number; color?: string; size?: string }, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart', data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/cart/${itemId}`, { quantity });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId: string, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/${itemId}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart');
    return null;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cart = { items: [], totalPrice: 0, totalItems: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => { state.cart = action.payload.cart; state.loading = false; })
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, (state, action) => { state.cart = action.payload.cart; state.loading = false; })
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.cart = action.payload.cart; })
      .addCase(removeCartItem.fulfilled, (state, action) => { state.cart = action.payload.cart; })
      .addCase(clearCart.fulfilled, (state) => { state.cart = { items: [], totalPrice: 0, totalItems: 0 }; });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
