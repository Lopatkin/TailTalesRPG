import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/axios';
import locationsData from '../../data/locationsData';

export const authenticatePlayer = createAsyncThunk(
  'player/authenticate',
  async (telegramData) => {
    const response = await api.post('/api/auth/telegram', telegramData);
    return response.data.player;
  }
);

export const fetchPlayerData = createAsyncThunk(
  'player/fetchData',
  async (telegramId) => {
    const response = await api.get(`/api/auth/me?telegramId=${telegramId}`);
    return response.data.player;
  }
);

export const updatePlayerLocation = createAsyncThunk(
  'player/updateLocation',
  async ({ playerId, locationId }) => {
    const response = await api.post(`/api/locations/${locationId}/move`, { playerId });
    return response.data;
  }
);

export const performAction = createAsyncThunk(
  'player/performAction',
  async ({ playerId, locationId, actionName }) => {
    const response = await api.post(`/api/locations/${locationId}/action`, { 
      playerId, 
      actionName 
    });
    return response.data;
  }
);

const initialState = {
  data: null,
  currentLocation: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerData: (state, action) => {
      state.data = action.payload;
      state.isAuthenticated = true;
    },
    setCurrentLocation: (state, action) => {
      console.log('Setting current location in playerSlice:', action.payload);
      state.currentLocation = action.payload;
    },
    updateExperience: (state, action) => {
      if (state.data) {
        state.data.experience = action.payload.experience;
        state.data.level = action.payload.level;
      }
    },
    addItemToInventory: (state, action) => {
      // Обновление инвентаря будет происходить через inventorySlice
    },
    logout: (state) => {
      state.data = null;
      state.currentLocation = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(authenticatePlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authenticatePlayer.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        const clientLocation = locationsData.find(loc => loc._id === action.payload.currentLocation);
        state.currentLocation = clientLocation || locationsData.find(loc => loc.type === 'forest') || locationsData[0];
        state.isAuthenticated = true;
      })
      .addCase(authenticatePlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPlayerData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlayerData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        const clientLocation = locationsData.find(loc => loc._id === action.payload.currentLocation);
        state.currentLocation = clientLocation || locationsData.find(loc => loc.type === 'forest') || locationsData[0];
        state.isAuthenticated = true;
      })
      .addCase(updatePlayerLocation.fulfilled, (state, action) => {
        state.currentLocation = locationsData.find(loc => loc._id === action.payload.newLocation._id);
        console.log('Player moved to new location:', state.currentLocation);
      })
      .addCase(performAction.fulfilled, (state, action) => {
        if (state.data) {
          state.data.experience = action.payload.newExperience;
          state.data.level = action.payload.newLevel;
        }
      });
  }
});

export const { 
  setPlayerData, 
  setCurrentLocation, 
  updateExperience, 
  addItemToInventory, 
  logout 
} = playerSlice.actions;

export default playerSlice.reducer;