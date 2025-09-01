import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useChatSocket } from '../hooks/useChatSocket';
import './ChatInput.css';

const ChatInput = () => {
  const player = useSelector(state => state.player.data);
  const currentLocation = useSelector(state => state.player.currentLocation);
  const locations = useSelector(state => state.location.locations);

  const locationObject = typeof currentLocation === 'string'
    ? locations.find(loc => loc._id === currentLocation)
    : currentLocation;

  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  const { participants, sendMessage: socketSend } = useChatSocket(player, locationObject);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !player || !locationObject) return;
    socketSend(message.trim());
    setMessage('');
  };

  // Не показываем блок ввода, если пользователь не авторизован или локация не выбрана
  if (!player || !locationObject) {
    return (
      <div className="chat-input-fixed">
        <form className="chat-input-form">
          <div className="chat-input-container">
            <button type="button" className="participants-button" disabled>
              👥 0
            </button>
            <input
              type="text"
              placeholder={!player ? "Войдите в игру..." : "Сначала выберите локацию..."}
              className="chat-input"
              disabled
            />
            <button type="button" className="send-button" disabled>
              ➤
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
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
  );
};

export default ChatInput;
