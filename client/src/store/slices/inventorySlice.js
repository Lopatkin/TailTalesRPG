import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchInventory = createAsyncThunk(
  'inventory/fetch',
  async (playerId) => {
    const response = await axios.get(`/api/players/${playerId}/inventory`);
    return response.data.inventory;
  }
);

export const useItem = createAsyncThunk(
  'inventory/useItem',
  async ({ playerId, itemId }) => {
    const response = await axios.post(`/api/players/${playerId}/use-item`, { itemId });
    return { itemId, ...response.data };
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { item, quantity = 1 } = action.payload;
      const existingItem = state.items.find(inv => inv.item._id === item._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ item, quantity });
      }
    },
    removeItem: (state, action) => {
      const { itemId, quantity = 1 } = action.payload;
      const existingItem = state.items.find(inv => inv.item._id === itemId);
      
      if (existingItem) {
        if (existingItem.quantity <= quantity) {
          state.items = state.items.filter(inv => inv.item._id !== itemId);
        } else {
          existingItem.quantity -= quantity;
        }
      }
    },
    clearInventory: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(useItem.fulfilled, (state, action) => {
        const { itemId, remainingQuantity } = action.payload;
        if (remainingQuantity === 0) {
          state.items = state.items.filter(inv => inv.item._id !== itemId);
        } else {
          const item = state.items.find(inv => inv.item._id === itemId);
          if (item) {
            item.quantity = remainingQuantity;
          }
        }
      });
  }
});

export const { addItem, removeItem, clearInventory } = inventorySlice.actions;
export default inventorySlice.reducer;

