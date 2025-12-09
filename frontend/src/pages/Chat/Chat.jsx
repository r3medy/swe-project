import { useEffect, useState, useRef, useCallback } from "react";
import "@/pages/Chat/Chat.css";
import { Navigation, Status } from "@/components";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router";

import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

function Chat() {
  const { user } = useSession();
  const navigate = useNavigate();
  const messageAreaRef = useRef(null);
  const selectedChatRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Keep ref in sync with state for use in interval
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/chats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data);

      // Use ref to get current selectedChat value
      if (selectedChatRef.current) {
        const updatedChat = data.find(
          (c) => c.chatId === selectedChatRef.current.chatId
        );
        if (updatedChat) setSelectedChat(updatedChat);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const res = await fetch(
        `http://localhost:8000/chats/${selectedChat.chatId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageContent: messageInput.trim() }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      setMessageInput("");
      await fetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherParticipant = (chat) => {
    if (!user) return null;
    return chat.freelancer.userId === user.userId
      ? chat.client
      : chat.freelancer;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  useEffect(() => {
    if (!user || !user.userId) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  const getAvatarUrl = (participant) => {
    if (participant?.profilePicture) {
      return `http://localhost:8000/${participant.profilePicture}`;
    }
    // Fallback to gender-based image
    if (participant?.gender === "Female") {
      return profileImage3;
    }
    return profileImage1; // Default to male image
  };

  return (
    <>
      <Navigation />
      <div className="chat-page">
        <div className="chat-container">
          <div className="sidebar">
            <div className="sidebar-header">Project Chats</div>
            <div className="contact-list">
              {loading ? (
                <Status text="Loading" subtext="Fetching your chats..." />
              ) : chats.length === 0 ? (
                <Status.Error
                  text="No Chats"
                  subtext="You don't have any chats yet"
                />
              ) : (
                chats.map((chat) => {
                  const other = getOtherParticipant(chat);
                  const isActive = selectedChat?.chatId === chat.chatId;

                  return (
                    <div
                      key={chat.chatId}
                      className={`contact-item ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <img
                        className="avatar"
                        src={getAvatarUrl(other)}
                        onError={(e) => (e.target.src = profileImage1)}
                        alt={`${other?.firstName}'s Avatar`}
                      />
                      <div className="contact-info">
                        <div className="contact-name">
                          {other?.firstName} {other?.lastName}
                        </div>
                        <div className="contact-status">
                          {chat.post.jobTitle}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="chat-area">
            {selectedChat ? (
              <>
                <div className="chat-header">
                  <img
                    className="avatar"
                    src={getAvatarUrl(getOtherParticipant(selectedChat))}
                    onError={(e) => (e.target.src = profileImage1)}
                    alt="Active Contact Avatar"
                  />
                  <div className="contact-info">
                    <div className="contact-name">
                      {getOtherParticipant(selectedChat)?.firstName}{" "}
                      {getOtherParticipant(selectedChat)?.lastName}
                    </div>
                    <div className="contact-status">
                      {selectedChat.post.jobTitle}
                    </div>
                  </div>
                </div>

                <div className="message-area" ref={messageAreaRef}>
                  {selectedChat.messages.length === 0 ? (
                    <Status.Error
                      text="No Messages"
                      subtext="Start the conversation!"
                    />
                  ) : (
                    selectedChat.messages.map((msg) => {
                      const isMe = msg.senderId === user?.userId;
                      return (
                        <div
                          key={msg.messageId}
                          className={`message ${
                            isMe ? "client" : "freelancer"
                          }`}
                        >
                          <div className="message-bubble">
                            <p>{msg.messageContent}</p>
                            <span className="timestamp">
                              {formatTime(msg.sentAt)}
                            </span>
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
                  <button onClick={sendMessage} disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            ) : (
              <div className="message-area">
                <Status.Error
                  text="No Chat Selected"
                  subtext="Select a chat to start messaging"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
