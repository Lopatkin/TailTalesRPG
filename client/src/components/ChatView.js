import React, { useEffect, useState, useRef } from 'react';
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

  const [message, setMessage] = useState('');
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

  const { participants: socketParticipants, sendMessage: socketSend, loadMore, loadingMore, hasMore } = useChatSocket(player, locationObject);
  useEffect(() => { setParticipants(socketParticipants); }, [socketParticipants]);

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

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !player || !locationObject) return;
    socketSend(message.trim());
    setMessage('');
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
        <div className="chat-input-fixed">
          <form className="chat-input-form">
            <div className="chat-input-container">
              <button type="button" className="participants-button" disabled>
                👥 0
              </button>
              <input
                type="text"
                placeholder="Сначала выберите локацию..."
                className="chat-input"
                disabled
              />
              <button type="button" className="send-button" disabled>
                ➤
              </button>
            </div>
          </form>
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

      <div className="chat-input-fixed">
        <form
          className="chat-input-form"
          onSubmit={sendMessage}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && showParticipants) {
              setShowParticipants(false);
            }
          }}
        >
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
            <button type="submit" className="send-button" disabled={!message.trim()}>
              ➤
            </button>
          </div>

          {showParticipants && (
            <div
              className="participants-overlay"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowParticipants(false);
              }}
              role="presentation"
            >
              <div className="participants-modal">
                <div className="modal-header">
                  <h3>Участники ({participants.length})</h3>
                  <button
                    type="button"
                    className="close-btn"
                    onClick={() => setShowParticipants(false)}
                    aria-label="Закрыть"
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-content">
                  {participants.length === 0 ? (
                    <div className="empty">Пока никого нет</div>
                  ) : participants.map((p) => (
                    <div key={p.playerId} className="participant-item">
                      <img className="avatar" src={p.avatar || '/avatar-placeholder.png'} alt="avatar" />
                      <span className="name">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatView;
