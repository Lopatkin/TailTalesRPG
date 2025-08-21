import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Header from './components/Header';
import Footer from './components/Footer';
import LocationView from './components/LocationView';
import ChatView from './components/ChatView';
import WorldMapView from './components/WorldMapView';
import ProfileView from './components/ProfileView';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
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
      </Router>
    </Provider>
  );
}

export default App;

