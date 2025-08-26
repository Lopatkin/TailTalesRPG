import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage, setCurrentLocation } from '../store/slices/chatSlice';
import { authenticatePlayer } from '../store/slices/playerSlice';
import './ChatView.css';

const ChatView = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);
  const messages = useSelector(state => state.chat.messages);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
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
      playerId: player._id
    });

    // Обновляем текущую локацию в чате
    dispatch(setCurrentLocation(currentLocation._id));

    // Слушаем новые сообщения
    newSocket.on('new-message', (messageData) => {
      dispatch(addMessage(messageData));
    });

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
      playerName: `${player.firstName} ${player.lastName}`.trim()
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
              <div className="message-header">
                <span className="player-name">{msg.playerName}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <div className="chat-input-container">
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
      </form>
    </div>
  );
};

export default ChatView;



