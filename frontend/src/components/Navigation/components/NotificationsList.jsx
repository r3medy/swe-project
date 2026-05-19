import React from "react";
import { LuBell, LuX } from "react-icons/lu";
// (bundle-barrel-imports) Direct import instead of barrel re-export
import Button from "@/components/Button/Button";

/**
 * NotificationsList component - extracted for re-render optimization
 * Uses React.memo to prevent unnecessary re-renders
 */
const NotificationsList = React.memo(function NotificationsList({
  notifications,
  onMarkAllRead,
  onDeleteNotification,
}) {
  if (!notifications?.length) {
    return (
      <div className="notifications-empty">
        <LuBell size={48} className="notifications-empty-icon" />
        <p>No notifications yet</p>
        <span>You're all caught up!</span>
      </div>
    );
  }

  return (
    <>
      <div className="notifications-actions">
        <Button.Text onClick={onMarkAllRead}>Mark all as read</Button.Text>
      </div>
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.notificationId}
            className={`notification-card ${
              !notification.isMarkedRead ? "unread" : ""
            }`}
          >
            <div className="notification-card-content">
              {/* (rendering-conditional-render) Ternary instead of && */}
              {!notification.isMarkedRead ? (
                <span className="notification-unread-dot" />
              ) : null}
              <div className="notification-card-text">
                <p className="notification-message">{notification.content}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleDateString()}
                  {" - "}
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <button
              className="notification-delete-btn"
              onClick={() => onDeleteNotification(notification.notificationId)}
              title="Delete notification"
            >
              <LuX size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
});

export default NotificationsList;
