import React from 'react';
import { useSelector } from 'react-redux';
import './Header.css';

const Header = () => {
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);
  const locations = useSelector(state => state.location.locations);
  
  // Получаем полный объект локации
  const locationObject = typeof currentLocation === 'string' 
    ? locations.find(loc => loc._id === currentLocation)
    : currentLocation;

  if (!player) {
    return (
      <header className="header">
        <div className="header-content">
          <h1>TailTales RPG</h1>
          <p>Войдите через Telegram для начала игры</p>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>{locationObject ? locationObject.name : 'Неизвестная локация'}</h1>
        </div>
        
        <div className="header-center">
          <div className="player-info">
            <div className="player-avatar">
              {player.avatar ? (
                <img src={player.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {player.firstName ? player.firstName[0] : '?'}
                </div>
              )}
            </div>
            <div className="player-details">
              <div className="player-name">
                {player.firstName} {player.lastName}
              </div>
              <div className="player-level">
                Уровень {player.level}
              </div>
            </div>
            <div className="experience-info">
              <span>Опыт:</span>
              <div className="exp-bar">
                <div 
                  className="exp-fill" 
                  style={{ 
                    width: `${(player.experience % 100) / 100 * 100}%` 
                  }}
                ></div>
              </div>
              <span>{player.experience % 100}/100</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;



