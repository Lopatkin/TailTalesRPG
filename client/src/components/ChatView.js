import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useChatSocket } from '../hooks/useChatSocket';
import { authenticatePlayer } from '../store/slices/playerSlice';
import './ChatView.css';

const ChatView = () => {
  const dispatch = useDispatch();
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);
  const locations = useSelector(state => state.location.locations);
  const messages = useSelector(state => state.chat.messages);

  const locationObject = typeof currentLocation === 'string'
    ? locations.find(loc => loc._id === currentLocation)
    : currentLocation;

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

  const { loadMore, loadingMore, hasMore } = useChatSocket(player, locationObject);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onMessagesScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop <= 40 && hasMore && !loadingMore && messages.length > 0) {
      const oldest = messages[0];
      const prevHeight = el.scrollHeight;
      loadMore(oldest.timestamp).then(() => {
        requestAnimationFrame(() => {
          const newHeight = el.scrollHeight;
          el.scrollTop = newHeight - prevHeight;
        });
      });
    }
  };



  if (!player) {
    return (
      <div className="chat-view">
        <div className="auth-message">
          <h2>Чат</h2>
          <p>Для доступа к чату необходимо войти в игру</p>
          <button onClick={handleTestLogin} className="test-login-button">
            Войти как тестовый пользователь
          </button>
        </div>
      </div>
    );
  }

  if (!locationObject) {
    return (
      <div className="chat-view">
        <div className="chat-messages">
          <div className="no-messages">
            <p>Перейдите в раздел "Карта" и выберите локацию</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-view">
      <div className="chat-messages" onScroll={onMessagesScroll}>
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
    </div>
  );
};

export default ChatView;
