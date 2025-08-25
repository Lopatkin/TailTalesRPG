import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInventory, useItem as inventoryUseItemThunk } from '../store/slices/inventorySlice';
import './ProfileView.css';

const ProfileView = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);
  const inventory = useSelector(state => state.inventory.items);
  const [selectedTab, setSelectedTab] = useState('profile');
  const [useItemResult, setUseItemResult] = useState(null);

  useEffect(() => {
    if (player) {
      dispatch(fetchInventory(player._id));
    }
  }, [dispatch, player]);

  const handleUseItem = async (itemId) => {
    if (!player) return;

    try {
      const result = await dispatch(inventoryUseItemThunk({
        playerId: player._id,
        itemId
      })).unwrap();

      setUseItemResult({
        type: 'success',
        message: result.message
      });

      setTimeout(() => setUseItemResult(null), 3000);
    } catch (error) {
      setUseItemResult({
        type: 'error',
        message: error.message || 'Не удалось использовать предмет'
      });
      setTimeout(() => setUseItemResult(null), 3000);
    }
  };

  if (!player) {
    return (
      <div className="profile-view">
        <div className="auth-message">
          <h2>Профиль игрока</h2>
          <p>Для доступа к профилю необходимо войти в игру</p>
        </div>
      </div>
      );
  }

  return (
    <div className="profile-view">
      <div className="profile-header">
        <h2>Профиль игрока</h2>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${selectedTab === 'profile' ? 'active' : ''}`}
          onClick={() => setSelectedTab('profile')}
        >
          Профиль
        </button>
        <button 
          className={`tab-button ${selectedTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setSelectedTab('inventory')}
        >
          Инвентарь ({inventory.length})
        </button>
      </div>

      {selectedTab === 'profile' && (
        <div className="profile-content">
          <div className="player-card">
            <div className="player-avatar-large">
              {player.avatar ? (
                <img src={player.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder-large">
                  {player.firstName ? player.firstName[0] : '?'}
                </div>
              )}
            </div>
            
            <div className="player-info-detailed">
              <h3>{player.firstName} {player.lastName}</h3>
              <p className="player-username">@{player.username}</p>
              
              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-label">Уровень:</span>
                  <span className="stat-value">{player.level}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Опыт:</span>
                  <span className="stat-value">{player.experience}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">До следующего уровня:</span>
                  <span className="stat-value">{100 - (player.experience % 100)}</span>
                </div>
              </div>

              <div className="player-attributes">
                <h4>Характеристики:</h4>
                <div className="attributes-grid">
                  <div className="attribute">
                    <span className="attribute-icon">💪</span>
                    <span className="attribute-name">Сила</span>
                    <span className="attribute-value">{player.stats.strength}</span>
                  </div>
                  <div className="attribute">
                    <span className="attribute-icon">🏃</span>
                    <span className="attribute-name">Ловкость</span>
                    <span className="attribute-value">{player.stats.agility}</span>
                  </div>
                  <div className="attribute">
                    <span className="attribute-icon">🧠</span>
                    <span className="attribute-name">Интеллект</span>
                    <span className="attribute-value">{player.stats.intelligence}</span>
                  </div>
                  <div className="attribute">
                    <span className="attribute-icon">❤️</span>
                    <span className="attribute-name">Выносливость</span>
                    <span className="attribute-value">{player.stats.vitality}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'inventory' && (
        <div className="inventory-content">
          <h3>Инвентарь</h3>
          
          {inventory.length === 0 ? (
            <div className="empty-inventory">
              <p>Ваш инвентарь пуст</p>
              <p>Исследуйте локации, чтобы найти предметы!</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {inventory.map((invItem, index) => (
                <div key={index} className="inventory-item">
                  <div className="item-icon">{invItem.item.icon || '📦'}</div>
                  <div className="item-info">
                    <div className="item-name">{invItem.item.name}</div>
                    <div className="item-description">{invItem.item.description}</div>
                    <div className="item-details">
                      <span className="item-type">{invItem.item.type}</span>
                      <span className="item-rarity">{invItem.item.rarity}</span>
                      {invItem.item.value > 0 && (
                        <span className="item-value">💰 {invItem.item.value}</span>
                      )}
                    </div>
                    <div className="item-quantity">
                      Количество: {invItem.quantity}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="use-item-button"
                      onClick={() => handleUseItem(invItem.item._id)}
                      disabled={invItem.item.type === 'resource'}
                    >
                      {invItem.item.type === 'resource' ? 'Нельзя использовать' : 'Использовать'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {useItemResult && (
        <div className={`use-item-result ${useItemResult.type}`}>
          {useItemResult.message}
        </div>
      )}
    </div>
  );
};

export default ProfileView;



