import React from "react";
import { Status } from "@/components";
import { getAvatarUrl, getOtherParticipant } from "../utils";
import profileImage1 from "@/assets/profilepictures/1.png";

const ChatSidebar = React.memo(function ChatSidebar({
  chats,
  selectedChatId,
  onSelectChat,
  loading,
  user,
}) {
  return (
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
            const other = getOtherParticipant(chat, user);
            const isActive = selectedChatId === chat.chatId;

            return (
              <div
                key={chat.chatId}
                className={`contact-item ${isActive ? "active" : ""}`}
                onClick={() => onSelectChat(chat.chatId)}
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
                  <div className="contact-status">{chat.post.jobTitle}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

export default ChatSidebar;
