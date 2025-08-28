import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addMessage, setCurrentLocation, clearMessages } from '../store/slices/chatSlice';
import api, { API_URL } from '../config/axios';

export function useChatSocket(player, locationObject) {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!player || !locationObject || !locationObject._id) return;

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

    // Обновляем текущую локацию в слайсе чата и загружаем историю
    (async () => {
      try {
        dispatch(setCurrentLocation(locationObject._id));
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
        }
      } catch (err) {
        // noop: ошибки загрузки истории логируются в компоненте при необходимости
      }
    })();

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [dispatch, player, locationObject]);

  const sendMessage = (text) => {
    if (!text || !socketRef.current || !player || !locationObject) return;
    const payload = {
      locationId: locationObject._id,
      playerId: player._id,
      message: text,
      playerName: `${player.firstName} ${player.lastName}`.trim(),
      playerAvatar: player.avatar || ''
    };
    socketRef.current.emit('send-message', payload);
  };

  return { participants, sendMessage };
}


