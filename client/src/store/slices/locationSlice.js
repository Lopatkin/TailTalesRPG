import { createSlice } from '@reduxjs/toolkit';
import locationsData from '../../data/locationsData';

const initialState = {
  locations: locationsData,
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
  }
});

export const { setCurrentLocation, clearCurrentLocation } = locationSlice.actions;
export default locationSlice.reducer;