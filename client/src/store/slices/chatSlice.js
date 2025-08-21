import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  currentLocationId: null,
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentLocation: (state, action) => {
      state.currentLocationId = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Ограничиваем количество сообщений в памяти
      if (state.messages.length > 100) {
        state.messages = state.messages.slice(-100);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setCurrentLocation, 
  addMessage, 
  clearMessages, 
  setLoading, 
  setError 
} = chatSlice.actions;

export default chatSlice.reducer;

