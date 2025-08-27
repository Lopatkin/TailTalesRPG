import { createSlice } from '@reduxjs/toolkit';
import { updatePlayerLocation } from './playerSlice';

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
      // Добавляем сообщение только если оно для текущей локации
      if (action.payload.locationId === state.currentLocationId) {
        state.messages.push(action.payload);
        // Ограничиваем количество сообщений в памяти
        if (state.messages.length > 100) {
          state.messages = state.messages.slice(-100);
        }
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePlayerLocation.fulfilled, (state, action) => {
        // При смене локации очищаем сообщения и обновляем ID текущей локации
        state.messages = [];
        state.currentLocationId = action.payload.newLocation._id;
        console.log('Chat cleared for new location:', action.payload.newLocation._id);
      });
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



