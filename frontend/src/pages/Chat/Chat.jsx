import { useEffect } from "react";
import { useNavigate } from "react-router";
import "@/pages/Chat/Chat.css";
import { Navigation, Status } from "@/components";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { useChat } from "./hooks/useChat";

function Chat() {
  const navigate = useNavigate();
  const {
    chats,
    selectedChatId,
    setSelectedChatId,
    selectedChat,
    loading,
    sendMessage,
    user,
    isFetchingSession,
  } = useChat();

  useEffect(() => {
    if (!isFetchingSession && (!user || !user.userId)) {
      navigate("/login");
    }
  }, [user, isFetchingSession, navigate]);

  if (isFetchingSession) {
    return (
      <>
        <Navigation />
        <div className="chat-page">
          <div className="chat-container">
            <Status text="Loading Session" subtext="Please wait..." />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="chat-page">
        <div className="chat-container">
          <ChatSidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            loading={loading}
            user={user}
          />

          <ChatWindow
            selectedChat={selectedChat} // This is the full object derived in useChat
            user={user}
            onSendMessage={sendMessage}
          />
        </div>
      </div>
    </>
  );
}

export default Chat;
