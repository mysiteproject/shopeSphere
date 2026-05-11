import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const register = createAsyncThunk('auth/register', async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (credential: string, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/google', { credential });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Google login failed');
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/profile');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get profile');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    return null;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data: Partial<User>, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async (productId: string, { rejectWithValue }) => {
  try {
    const res = await api.post(`/auth/wishlist/${productId}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(register.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.isAuthenticated = true; });
    builder.addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    // Login
    builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.isAuthenticated = true; });
    builder.addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    // Google Login
    builder.addCase(googleLogin.fulfilled, (state, action) => { state.user = action.payload.user; state.isAuthenticated = true; });
    // Get Profile
    builder.addCase(getProfile.fulfilled, (state, action) => { state.user = action.payload.user; state.isAuthenticated = true; });
    builder.addCase(getProfile.rejected, (state) => { state.user = null; state.isAuthenticated = false; });
    // Logout
    builder.addCase(logout.fulfilled, (state) => { state.user = null; state.isAuthenticated = false; });
    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload.user; });
    // Toggle Wishlist
    builder.addCase(toggleWishlist.fulfilled, (state, action) => {
      if (state.user) state.user.wishlist = action.payload.wishlist;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
