import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { performAction, authenticatePlayer } from '../store/slices/playerSlice';
import { fetchLocationById } from '../store/slices/locationSlice';
import { addItem } from '../store/slices/inventorySlice';
import './LocationView.css';

const LocationView = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);
  const [selectedTab, setSelectedTab] = useState('location');
  const [actionResult, setActionResult] = useState(null);

  useEffect(() => {
    if (player && player.currentLocation) {
      dispatch(fetchLocationById(player.currentLocation));
    }
  }, [dispatch, player]);

  const handleAction = async (actionName) => {
    if (!player || !currentLocation) return;

    try {
      const result = await dispatch(performAction({
        playerId: player._id,
        locationId: currentLocation._id,
        actionName
      })).unwrap();

      // Добавляем предмет в инвентарь
      if (result.itemGained) {
        const action = currentLocation.availableActions.find(a => a.name === actionName);
        if (action && action.itemReward) {
          dispatch(addItem({ item: action.itemReward, quantity: 1 }));
        }
      }

      setActionResult({
        type: 'success',
        message: result.message,
        experienceGained: result.experienceGained,
        itemGained: result.itemGained
      });

      // Очищаем результат через 3 секунды
      setTimeout(() => setActionResult(null), 3000);
    } catch (error) {
      setActionResult({
        type: 'error',
        message: error.message || 'Произошла ошибка при выполнении действия'
      });
      setTimeout(() => setActionResult(null), 3000);
    }
  };

  if (!player) {
    return (
      <div className="location-view">
        <div className="auth-message">
          <h2>Добро пожаловать в TailTales RPG!</h2>
          <p>Для начала игры необходимо войти через Telegram</p>
          <button className="telegram-auth-btn">
            Войти через Telegram
          </button>
          <div style={{ marginTop: '12px' }}>
            <button
              className="telegram-auth-btn"
              onClick={() => dispatch(authenticatePlayer({
                telegramId: 'TEST_USER_001',
                username: 'test_user',
                firstName: 'Test',
                lastName: 'User',
                avatar: ''
              }))}
            >
              Войти как тестовый игрок
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLocation) {
    return (
      <div className="location-view">
        <div className="loading">Загрузка локации...</div>
      </div>
    );
  }

  return (
    <div className="location-view">
      <div className="location-header">
        <h2>{currentLocation.name}</h2>
        <p className="location-description">{currentLocation.description}</p>
      </div>

      <div className="location-tabs">
        <button 
          className={`tab-button ${selectedTab === 'location' ? 'active' : ''}`}
          onClick={() => setSelectedTab('location')}
        >
          Локация
        </button>
        <button 
          className={`tab-button ${selectedTab === 'items' ? 'active' : ''}`}
          onClick={() => setSelectedTab('items')}
        >
          Предметы на локации
        </button>
      </div>

      {selectedTab === 'location' && (
        <div className="location-content">
          <div className="location-visual">
            <div className="location-background">
              {currentLocation.backgroundImage ? (
                <img src={currentLocation.backgroundImage} alt={currentLocation.name} />
              ) : (
                <div className="location-placeholder">
                  🏞️ {currentLocation.name}
                </div>
              )}
            </div>
          </div>

          <div className="location-actions">
            <h3>Доступные действия:</h3>
            {currentLocation.availableActions && currentLocation.availableActions.length > 0 ? (
              <div className="actions-list">
                {currentLocation.availableActions.map((action, index) => (
                  <button
                    key={index}
                    className="action-button"
                    onClick={() => handleAction(action.name)}
                    disabled={player.level < action.requiredLevel}
                  >
                    <div className="action-name">{action.name}</div>
                    <div className="action-description">{action.description}</div>
                    <div className="action-rewards">
                      {action.experienceReward && (
                        <span className="exp-reward">+{action.experienceReward} опыта</span>
                      )}
                      {action.itemReward && (
                        <span className="item-reward">+ предмет</span>
                      )}
                    </div>
                    {player.level < action.requiredLevel && (
                      <div className="level-requirement">
                        Требуется уровень {action.requiredLevel}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="no-actions">На этой локации нет доступных действий</p>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'items' && (
        <div className="location-items">
          <h3>Предметы на локации:</h3>
          {currentLocation.availableActions && currentLocation.availableActions.length > 0 ? (
            <div className="items-list">
              {currentLocation.availableActions
                .filter(action => action.itemReward)
                .map((action, index) => (
                  <div key={index} className="location-item">
                    <div className="item-icon">{action.itemReward.icon || '📦'}</div>
                    <div className="item-info">
                      <div className="item-name">{action.itemReward.name}</div>
                      <div className="item-description">{action.itemReward.description}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="no-items">На этой локации нет предметов</p>
          )}
        </div>
      )}

      {actionResult && (
        <div className={`action-result ${actionResult.type}`}>
          <div className="result-message">{actionResult.message}</div>
          {actionResult.experienceGained > 0 && (
            <div className="exp-gained">+{actionResult.experienceGained} опыта</div>
          )}
          {actionResult.itemGained && (
            <div className="item-gained">Предмет добавлен в инвентарь!</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationView;



