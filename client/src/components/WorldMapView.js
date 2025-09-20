import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLocations } from '../store/slices/locationSlice';
import { updatePlayerLocation } from '../store/slices/playerSlice';
import './WorldMapView.css';

const WorldMapView = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);
  const locations = useSelector(state => state.location.locations);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [moveResult, setMoveResult] = useState(null);
  
  // Получаем полный объект текущей локации
  const currentLocationObject = typeof currentLocation === 'string' 
    ? locations.find(loc => loc._id === currentLocation)
    : currentLocation;

  useEffect(() => {
    if (player) {
      dispatch(fetchLocations(player._id));
    }
  }, [dispatch, player]);

  useEffect(() => {
    if (currentLocationObject) {
      setSelectedLocation(currentLocationObject);
    }
  }, [currentLocationObject]);

  const handleMove = async (targetLocation) => {
    if (!player || !currentLocationObject) return;

    try {
      const result = await dispatch(updatePlayerLocation({
        playerId: player._id,
        locationId: targetLocation._id
      })).unwrap();

      setMoveResult({
        type: 'success',
        message: result.message
      });

      setTimeout(() => setMoveResult(null), 3000);
    } catch (error) {
      setMoveResult({
        type: 'error',
        message: error.message || 'Не удалось переместиться в эту локацию'
      });
      setTimeout(() => setMoveResult(null), 3000);
    }
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'forest': return '🌲';
      case 'village': return '🏘️';
      case 'swamp': return '🌿';
      case 'cave': return '🕳️';
      case 'house': return '🏠';
      default: return '📍';
    }
  };

  const getDirectionArrow = (direction) => {
    switch (direction) {
      case 'north': return '⬆️';
      case 'south': return '⬇️';
      case 'east': return '➡️';
      case 'west': return '⬅️';
      default: return '↔️';
    }
  };

  if (!player) {
    return (
      <div className="world-map-view">
        <div className="auth-message">
          <h2>Карта мира</h2>
          <p>Для доступа к карте необходимо войти в игру</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="world-map-view">
        <div className="loading">Загрузка карты мира...</div>
      </div>
    );
  }

  return (
    <div className="world-map-view">
      <div className="map-header">
        <h2>Карта мира</h2>
        <p>Исследуйте мир и перемещайтесь между локациями</p>
      </div>

      <div className="map-container">
        <div className="map-grid">
          {locations.map((location) => {
            const isCurrent = currentLocationObject && currentLocationObject._id === location._id;
            const isConnected = currentLocationObject && 
              currentLocationObject.connectedLocations?.some(
                conn => conn.location === location._id
              );
            // Персональный дом всегда доступен для владельца
            const isOwnHouse = location.type === 'house' && player && location.owner === player._id;
            const canMove = (isConnected || isOwnHouse) && !isCurrent;

            return (
              <div
                key={location._id}
                className={`map-location ${isCurrent ? 'current' : ''} ${canMove ? 'connected' : ''} ${!isConnected && !isCurrent ? 'unreachable' : ''}`}
                style={{
                  gridColumn: location.coordinates.x + 2,
                  gridRow: location.coordinates.y + 2
                }}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="location-icon">
                  {getLocationIcon(location.type)}
                </div>
                <div className="location-name">{location.name}</div>
                {isCurrent && <div className="current-indicator">📍</div>}
              </div>
            );
          })}
        </div>
      </div>

      {selectedLocation && (
        <div className="location-details">
          <div className="details-header">
            <h3>{selectedLocation.name}</h3>
            <div className="location-type">
              {getLocationIcon(selectedLocation.type)} {selectedLocation.type}
            </div>
          </div>
          
          <div className="details-content">
            <p className="location-description">{selectedLocation.description}</p>
            
            <div className="location-connections">
              <h4>Связанные локации:</h4>
              {selectedLocation.connectedLocations && selectedLocation.connectedLocations.length > 0 ? (
                <div className="connections-list">
                  {selectedLocation.connectedLocations.map((connection, index) => {
                    const targetLocation = locations.find(l => l._id === connection.location);
                    if (!targetLocation) return null;

                    const isCurrent = currentLocationObject && currentLocationObject._id === targetLocation._id;
                    const canMove = currentLocationObject && currentLocationObject._id === selectedLocation._id;

                    return (
                      <div key={index} className="connection-item">
                        <div className="connection-direction">
                          {getDirectionArrow(connection.direction)} {connection.direction}
                        </div>
                        <div className="connection-location">
                          {targetLocation.name}
                        </div>
                        {canMove && !isCurrent && (
                          <button
                            className="move-button"
                            onClick={() => handleMove(targetLocation)}
                          >
                            Перейти
                          </button>
                        )}
                        {isCurrent && (
                          <span className="current-location">Текущая локация</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>Нет связанных локаций</p>
              )}
              
              {/* Показываем персональный дом, если он не текущая локация */}
              {player && player.houseLocation && selectedLocation._id !== player.houseLocation._id && (
                <div className="connections-list">
                  <div className="connection-item">
                    <div className="connection-direction">
                      🏠 Дом
                    </div>
                    <div className="connection-location">
                      {player.houseLocation.name}
                    </div>
                    <button
                      className="move-button"
                      onClick={() => handleMove(player.houseLocation)}
                    >
                      Перейти
                    </button>
                  </div>
                </div>
              )}
            </div>

            {currentLocationObject && currentLocationObject._id === selectedLocation._id && (
              <div className="current-location-info">
                <h4>Вы находитесь здесь</h4>
                <p>Используйте вкладку "Локация" для взаимодействия с объектами</p>
              </div>
            )}
          </div>
        </div>
      )}

      {moveResult && (
        <div className={`move-result ${moveResult.type}`}>
          {moveResult.message}
        </div>
      )}
    </div>
  );
};

export default WorldMapView;



