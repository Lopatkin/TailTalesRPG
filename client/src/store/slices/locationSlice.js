import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchLocations = createAsyncThunk(
  'location/fetchAll',
  async () => {
    const response = await axios.get('/api/locations');
    return response.data.locations;
  }
);

export const fetchLocationById = createAsyncThunk(
  'location/fetchById',
  async (locationId) => {
    const response = await axios.get(`/api/locations/${locationId}`);
    return response.data.location;
  }
);

const initialState = {
  locations: [],
  currentLocation: null,
  loading: false,
  error: null
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    clearCurrentLocation: (state) => {
      state.currentLocation = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchLocationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLocation = action.payload;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setCurrentLocation, clearCurrentLocation } = locationSlice.actions;
export default locationSlice.reducer;



