import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Order } from '@/types';

interface OrderState {
  orders: Order[];
  order: Order | null;
  totalPages: number;
  page: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  order: null,
  totalPages: 0,
  page: 1,
  total: 0,
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk('order/create', async (data: any, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const fetchMyOrders = createAsyncThunk('order/fetchMy', async (page: number = 1, { rejectWithValue }) => {
  try {
    const res = await api.get(`/orders/my-orders?page=${page}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const fetchOrder = createAsyncThunk('order/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const cancelOrder = createAsyncThunk('order/cancel', async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/cancel`, { reason });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => { state.order = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; })
      .addCase(createOrder.fulfilled, (state, action) => { state.loading = false; state.order = action.payload.order; })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.total = action.payload.total;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchOrder.fulfilled, (state, action) => { state.order = action.payload.order; state.loading = false; })
      .addCase(cancelOrder.fulfilled, (state, action) => { state.order = action.payload.order; });
  },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
