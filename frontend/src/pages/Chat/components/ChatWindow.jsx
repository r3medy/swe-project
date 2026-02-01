import React, { useState, useRef, useEffect } from "react";
import { Status } from "@/components";
import { getAvatarUrl, getOtherParticipant, formatTime } from "../utils";
import profileImage1 from "@/assets/profilepictures/1.png";

const ChatWindow = React.memo(function ChatWindow({
  selectedChat,
  user,
  onSendMessage,
}) {
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const messageAreaRef = useRef(null);

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    setSending(true);
    const success = await onSendMessage(messageInput);
    if (success) {
      setMessageInput("");
    }
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedChat) {
    return (
      <div className="chat-area">
        <div className="message-area">
          <Status.Error
            text="No Chat Selected"
            subtext="Select a chat to start messaging"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <img
          className="avatar"
          src={getAvatarUrl(getOtherParticipant(selectedChat, user))}
          onError={(e) => (e.target.src = profileImage1)}
          alt="Active Contact Avatar"
        />
        <div className="contact-info">
          <div className="contact-name">
            {getOtherParticipant(selectedChat, user)?.firstName}{" "}
            {getOtherParticipant(selectedChat, user)?.lastName}
          </div>
          <div className="contact-status">{selectedChat.post.jobTitle}</div>
        </div>
      </div>

      <div className="message-area" ref={messageAreaRef}>
        {selectedChat.messages.length === 0 ? (
          <Status.Error text="No Messages" subtext="Start the conversation!" />
        ) : (
          selectedChat.messages.map((msg) => {
            const isMe = msg.senderId === user?.userId;
            return (
              <div
                key={msg.messageId}
                className={`message ${isMe ? "client" : "freelancer"}`}
              >
                <div className="message-bubble">
                  <p>{msg.messageContent}</p>
                  <span className="timestamp">{formatTime(msg.sentAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message here..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
        />
        <button onClick={handleSendMessage} disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
  // End of component
});

export default ChatWindow;
