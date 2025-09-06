import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addMessage, addMessagesPrepend, clearMessages, setCurrentLocation as setChatCurrentLocation } from '../store/slices/chatSlice';
import api, { API_URL } from '../config/axios';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const connectToLocation = useCallback((player, locationObject) => {
    if (!player || !locationObject || !locationObject._id) return;

    // Проверяем, не подключены ли мы уже к этой локации с этим игроком
    if (currentPlayer && currentLocation && 
        currentPlayer._id === player._id && 
        currentLocation._id === locationObject._id &&
        socketRef.current && socketRef.current.connected) {
      return; // Уже подключены к нужной локации
    }

    // Закрываем предыдущее соединение при смене локации/пользователя
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Подключение
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || API_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000
    });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      // Присоединяемся к комнате
      newSocket.emit('join-location', {
        locationId: locationObject._id,
        playerId: player._id,
        playerName: `${player.firstName} ${player.lastName}`.trim(),
        playerAvatar: player.avatar || ''
      });
    });

    newSocket.on('new-message', (messageData) => {
      dispatch(addMessage(messageData));
    });

    newSocket.on('participants-update', (list) => {
      setParticipants(list);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setParticipants([]);
    });

    // Обновляем текущую локацию в слайсе чата и загружаем историю
    (async () => {
      try {
        dispatch(setChatCurrentLocation(locationObject._id));
        dispatch(clearMessages());
        const res = await api.get(`/api/messages/location/${locationObject._id}?limit=100`);
        if (res.data && Array.isArray(res.data)) {
          res.data.forEach((m) => {
            dispatch(addMessage({
              _id: m._id,
              locationId: locationObject._id,
              playerId: m.player,
              playerName: m.playerName,
              playerAvatar: m.playerAvatar,
              message: m.text,
              timestamp: m.createdAt
            }));
          });
          setHasMore(res.data.length >= 100);
        }
      } catch (err) {
        // noop: ошибки загрузки истории логируются в компоненте при необходимости
      }
    })();

    setCurrentPlayer(player);
    setCurrentLocation(locationObject);
  }, [dispatch, currentPlayer, currentLocation]);

  const loadMore = async (oldestTimestamp) => {
    if (loadingMore || !hasMore || !currentLocation) return;
    setLoadingMore(true);
    try {
      const res = await api.get(`/api/messages/location/${currentLocation._id}?limit=50&before=${encodeURIComponent(oldestTimestamp)}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const batch = res.data.map(m => ({
          _id: m._id,
          locationId: currentLocation._id,
          playerId: m.player,
          playerName: m.playerName,
          playerAvatar: m.playerAvatar,
          message: m.text,
          timestamp: m.createdAt
        }));
        dispatch(addMessagesPrepend(batch));
        if (res.data.length < 50) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const sendMessage = (text) => {
    if (!text || !socketRef.current || !currentPlayer || !currentLocation) return;
    const payload = {
      locationId: currentLocation._id,
      playerId: currentPlayer._id,
      message: text,
      playerName: `${currentPlayer.firstName} ${currentPlayer.lastName}`.trim(),
      playerAvatar: currentPlayer.avatar || ''
    };
    socketRef.current.emit('send-message', payload);
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setParticipants([]);
    setCurrentPlayer(null);
    setCurrentLocation(null);
    setHasMore(true);
    setLoadingMore(false);
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const value = {
    participants,
    sendMessage,
    loadMore,
    loadingMore,
    hasMore,
    connectToLocation,
    disconnect,
    isConnected: socketRef.current?.connected || false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
