import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage, setCurrentLocation, clearMessages } from '../store/slices/chatSlice';
import axios from 'axios';
import { authenticatePlayer } from '../store/slices/playerSlice';
import './ChatView.css';

const ChatView = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);
  const messages = useSelector(state => state.chat.messages);
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

  useEffect(() => {
    if (!player || !currentLocation) return;

    // Подключаемся к Socket.io
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Присоединяемся к чату локации
    newSocket.emit('join-location', {
      locationId: currentLocation._id,
      playerId: player._id,
      playerName: `${player.firstName} ${player.lastName}`.trim(),
      playerAvatar: player.avatar || ''
    });

    // Обновляем текущую локацию в чате
    dispatch(setCurrentLocation(currentLocation._id));
    // Очищаем сообщения при смене локации и перед загрузкой истории
    dispatch(clearMessages());

    // Слушаем новые сообщения
    newSocket.on('new-message', (messageData) => {
      dispatch(addMessage(messageData));
    });
    newSocket.on('participants-update', (list) => {
      setParticipants(list);
    });

    // Запрашиваем историю сообщений
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/api/messages/location/${currentLocation._id}?limit=100`);
        res.data.forEach((m) => {
          dispatch(addMessage({
            _id: m._id,
            locationId: currentLocation._id,
            playerId: m.player,
            playerName: m.playerName,
            playerAvatar: m.playerAvatar,
            message: m.text,
            timestamp: m.createdAt
          }));
        });
      } catch (err) {
        // ignore for now
      }
    })();

    return () => {
      newSocket.close();
    };
  }, [dispatch, player, currentLocation]);

  useEffect(() => {
    // Прокручиваем к последнему сообщению
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !player || !currentLocation) return;

    const messageData = {
      locationId: currentLocation._id,
      playerId: player._id,
      message: message.trim(),
      playerName: `${player.firstName} ${player.lastName}`.trim(),
      playerAvatar: player.avatar || ''
    };

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

  if (!currentLocation) {
    return (
      <div className="chat-view">
        <div className="loading">Загрузка чата...</div>
      </div>
    );
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <h2>Чат локации: {currentLocation.name}</h2>
        <p className="chat-description">
          Общайтесь с другими игроками в этой локации
        </p>
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
                  <img className="avatar" src={msg.playerAvatar || '/avatar-placeholder.png'} alt="avatar" />
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



