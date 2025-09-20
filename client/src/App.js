import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { SocketProvider } from './contexts/SocketContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LocationView from './components/LocationView';
import ChatView from './components/ChatView';
import ChatInput from './components/ChatInput';
import WorldMapView from './components/WorldMapView';
import ProfileView from './components/ProfileView';
import './App.css';
import { authenticatePlayer, setCurrentLocation } from './store/slices/playerSlice';
import locationsData from './data/locationsData';

const AppContent = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);
  const locations = useSelector(state => state.location.locations);
  const location = useLocation();
<<<<<<< HEAD
=======

  useEffect(() => {
    // Загружаем локации при первом запуске
    if (locations.length === 0) {
      dispatch(fetchLocations());
    }
  }, [dispatch, locations.length, locations]);
>>>>>>> 828c01af92d200df38108a7d47f905449aab6959

  useEffect(() => {
    const isTelegramWebApp = typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;

    if (!player && isTelegramWebApp) {
      try {
        const wa = window.Telegram.WebApp;
        if (wa && typeof wa.ready === 'function') {
          wa.ready();
        }

        const tgUser = wa?.initDataUnsafe?.user;
        if (tgUser && tgUser.id) {
          dispatch(authenticatePlayer({
            telegramId: String(tgUser.id),
            username: tgUser.username || `tg_${tgUser.id}`,
            firstName: tgUser.first_name || 'Player',
            lastName: tgUser.last_name || '',
            avatar: tgUser.photo_url || ''
          }));
          return;
        }
      } catch (e) {
        // игнорируем и упадём на тестовый вход
      }
    }

    if (!player) {
      setTimeout(() => {
        dispatch(authenticatePlayer({
          telegramId: 'TEST_USER_001',
          username: 'test_user',
          firstName: 'Test',
          lastName: 'User',
          avatar: ''
        }));
      }, 100);
    }
  }, [dispatch, player]);

  useEffect(() => {
    if (player && !player.currentLocation && locations.length > 0) {
      const defaultLocation = locations.find(loc => loc.type === 'forest') || locations[0];
      if (defaultLocation) {
        console.log('Setting default location:', defaultLocation);
        dispatch(setCurrentLocation(defaultLocation));
      }
    }
  }, [dispatch, player, locations]);

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={
            <div className="chat-page">
              <ChatView />
            </div>
          } />
          <Route path="/location" element={<LocationView />} />
          <Route path="/map" element={<WorldMapView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </main>
      {location.pathname === '/chat' && <ChatInput />}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </Provider>
  );
}

export default App;