import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './slices/playerSlice';
import locationReducer from './slices/locationSlice';
import inventoryReducer from './slices/inventorySlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    player: playerReducer,
    location: locationReducer,
    inventory: inventoryReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['chat/addMessage'],
        ignoredPaths: ['chat.messages'],
      },
    }),
});


