import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage, setCurrentLocation, clearMessages } from '../store/slices/chatSlice';
import api from '../config/axios';
import { authenticatePlayer } from '../store/slices/playerSlice';
import './ChatView.css';

const ChatView = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);
  const locations = useSelector(state => state.location.locations);
  const messages = useSelector(state => state.chat.messages);
  
  // Получаем полный объект локации
  const locationObject = typeof currentLocation === 'string' 
    ? locations.find(loc => loc._id === currentLocation)
    : currentLocation;
  

  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef(null);

  const handleTestLogin = () => {
    dispatch(authenticatePlayer({
      telegramId: 'TEST_USER_001',
      username: 'test_user',
      firstName: 'Test',
      lastName: 'User',
      avatar: ''
    }));
  };

  // Стабильная функция для закрытия socket
  const closeSocket = useCallback(() => {
    if (socket && socket.connected) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);
  

  useEffect(() => {
    console.log('ChatView useEffect:', { player, currentLocation, locationObject });
    if (!player || !locationObject) return;
    
    // Проверяем, что у локации есть ID
    if (!locationObject._id) {
      console.error('Location has no _id:', locationObject);
      return;
    }
    
    // Если это новая локация, закрываем старый socket
    closeSocket();

    // Подключаемся к Socket.io
    console.log('Connecting to Socket.io...');
    const newSocket = io('https://tailtalesrpg.onrender.com', {
      transports: ['websocket', 'polling'],
      timeout: 20000
    });
    
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    setSocket(newSocket);

    // Присоединяемся к чату локации
    newSocket.emit('join-location', {
      locationId: locationObject._id,
      playerId: player._id,
      playerName: `${player.firstName} ${player.lastName}`.trim(),
      playerAvatar: player.avatar || ''
    });

    // Обновляем текущую локацию в чате (только ID для фильтрации сообщений)
    dispatch(setCurrentLocation(locationObject._id));
    // Очищаем сообщения при смене локации и перед загрузкой истории
    dispatch(clearMessages());

    // Слушаем новые сообщения
    newSocket.on('new-message', (messageData) => {
      console.log('Received new message:', messageData);
      dispatch(addMessage(messageData));
    });
    newSocket.on('participants-update', (list) => {
      console.log('Participants update:', list);
      setParticipants(list);
    });

    // Запрашиваем историю сообщений
    (async () => {
      try {
        console.log('Loading messages for location:', locationObject._id);
        const res = await api.get(`/api/messages/location/${locationObject._id}?limit=100`);
        if (res.data && Array.isArray(res.data)) {
          console.log('Loaded messages:', res.data.length);
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
        console.error('Failed to load messages:', err);
        console.error('Error details:', err.response?.data);
      }
    })();

    return () => {
      newSocket.close();
    };
  }, [dispatch, player, locationObject, currentLocation, closeSocket]);

  useEffect(() => {
    // Прокручиваем к последнему сообщению
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    console.log('sendMessage called:', { message: message.trim(), socket: !!socket, player: !!player, locationObject: !!locationObject });
    
    if (!message.trim() || !socket || !player || !locationObject) {
      console.log('sendMessage validation failed:', { 
        hasMessage: !!message.trim(), 
        hasSocket: !!socket, 
        hasPlayer: !!player, 
        hasLocation: !!locationObject 
      });
      return;
    }

    const messageData = {
      locationId: locationObject._id,
      playerId: player._id,
      message: message.trim(),
      playerName: `${player.firstName} ${player.lastName}`.trim(),
      playerAvatar: player.avatar || ''
    };

    console.log('Emitting send-message:', messageData);
    socket.emit('send-message', messageData);
    setMessage('');
  };

  if (!player) {
    return (
      <div className="chat-view">
        <div className="auth-message">
          <h2>Чат</h2>
          <p>Для доступа к чату необходимо войти в игру</p>
          <button 
            onClick={handleTestLogin}
            className="test-login-button"
          >
            Войти как тестовый пользователь
          </button>
        </div>
      </div>
    );
  }

  if (!locationObject) {
    return (
      <div className="chat-view">
        <div className="chat-header">
          <h2>Чат</h2>
          <p className="chat-description">
            Выберите локацию для начала общения
          </p>
        </div>
        <div className="chat-messages">
          <div className="no-messages">
            <p>Перейдите в раздел "Карта" и выберите локацию</p>
          </div>
        </div>
        <form className="chat-input-form">
          <div className="chat-input-container">
            <button 
              type="button"
              className="participants-button"
              disabled
            >
              👥 0
            </button>
            <input
              type="text"
              placeholder="Сначала выберите локацию..."
              className="chat-input"
              disabled
            />
            <button 
              type="button" 
              className="send-button"
              disabled
            >
              Отправить
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <h2>{locationObject.name}</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Пока нет сообщений в чате</p>
            <p>Будьте первым, кто напишет!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.playerId === player._id ? 'own-message' : 'other-message'}`}
            >
              {msg.playerId !== player._id && (
                <div className="message-header with-avatar">
                  {msg.playerAvatar ? (
                    <img className="avatar" src={msg.playerAvatar} alt="avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {msg.playerName ? msg.playerName[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <span className="player-name">{msg.playerName}</span>
                  <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              )}
              {msg.playerId === player._id && (
                <div className="message-header own">
                  <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              )}
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <div className="chat-input-container">
          <button 
            type="button"
            className="participants-button"
            onClick={() => setShowParticipants((s) => !s)}
          >
            👥 {participants.length || 0}
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="chat-input"
            maxLength={200}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!message.trim()}
          >
            Отправить
          </button>
        </div>
        <div className="message-counter">
          {message.length}/200
        </div>
        {showParticipants && (
          <div className="participants-list">
            {participants.length === 0 ? (
              <div className="empty">Пока никого нет</div>
            ) : participants.map((p) => (
              <div key={p.playerId} className="participant-item">
                <img className="avatar" src={p.avatar || '/avatar-placeholder.png'} alt="avatar" />
                <span className="name">{p.name}</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatView;



