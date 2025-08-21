import React from 'react';
import { useSelector } from 'react-redux';
import './Header.css';

const Header = () => {
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);

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
          <h1>{currentLocation ? currentLocation.name : 'Неизвестная локация'}</h1>
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
          </div>
        </div>
        
        <div className="header-right">
          <div className="experience-bar">
            <div className="exp-label">Опыт</div>
            <div className="exp-bar">
              <div 
                className="exp-fill" 
                style={{ 
                  width: `${(player.experience % 100) / 100 * 100}%` 
                }}
              ></div>
            </div>
            <div className="exp-text">
              {player.experience % 100} / 100
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


