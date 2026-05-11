import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  mobileMenuOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: false,
  searchOpen: false,
  cartOpen: false,
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeAll: (state) => {
      state.sidebarOpen = false;
      state.searchOpen = false;
      state.cartOpen = false;
      state.mobileMenuOpen = false;
    },
  },
});

export const { toggleSidebar, toggleSearch, toggleCart, toggleMobileMenu, closeAll } = uiSlice.actions;
export default uiSlice.reducer;
