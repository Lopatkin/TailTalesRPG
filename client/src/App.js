import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import Header from './components/Header';
import Footer from './components/Footer';
import LocationView from './components/LocationView';
import ChatView from './components/ChatView';
import WorldMapView from './components/WorldMapView';
import ProfileView from './components/ProfileView';
import './App.css';
import { authenticatePlayer } from './store/slices/playerSlice';

const AppContent = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);

  useEffect(() => {
    const isTelegramWebApp = typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;
    if (!player && !isTelegramWebApp) {
      dispatch(authenticatePlayer({
        telegramId: 'TEST_USER_001',
        username: 'test_user',
        firstName: 'Test',
        lastName: 'User',
        avatar: ''
      }));
    }
  }, [dispatch, player]);

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LocationView />} />
          <Route path="/chat" element={<ChatView />} />
          <Route path="/map" element={<WorldMapView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;



