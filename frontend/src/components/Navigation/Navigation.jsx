import "@/components/Navigation/Navigation.css";
import { Button, Dropdown, Drawer, Input, SideDrawer } from "@/components";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "@/contexts/SessionContext";
import { changePasswordSchema } from "@/models/changepassword.zod";
import { toast } from "react-hot-toast";

import {
  LuLoaderCircle,
  LuFlower,
  LuSunMedium,
  LuMoon,
  LuChevronDown,
  LuUser,
  LuUsers,
  LuLogOut,
  LuFileText,
  LuKey,
  LuTrash,
  LuAlarmClockCheck,
  LuBell,
  LuTag,
  LuX,
} from "react-icons/lu";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isFetchingSession, logout } = useSession();
  const [currentDrawer, setCurrentDrawer] = useState(false);
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] =
    useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    e.preventDefault();
    const { success, error } = changePasswordSchema.safeParse(passwords);
    if (!success) {
      setPasswordErrors(error.flatten().fieldErrors);
      return;
    }

    setIsPasswordLoading(true);
    fetch("http://localhost:8000/auth/changePassword", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwords),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          toast.success("Password changed successfully");
          setIsPasswordLoading(false);
          setCurrentDrawer(null);
          setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setPasswordErrors({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          toast.error(data.message || data.error);
          setIsPasswordLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("An error occurred");
      });
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setIsDeleteLoading(true);

    fetch("http://localhost:8000/auth/deleteAccount", {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          setIsDeleteLoading(false);
          toast.success("Account deleted successfully");
          setCurrentDrawer(null);
          navigate(0);
        } else {
          setIsDeleteLoading(false);
          toast.error(data.message || data.error);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("An error occurred");
      });
  };

  const handleReadAllNotifications = () => {
    fetch("http://localhost:8000/notifications/markallread", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, isMarkedRead: 1 }))
          );
          toast.success("All notifications marked as read");
        }
      })
      .catch(() => toast.error("Failed to mark as read"));
  };

  const handleDeleteNotification = (notificationId) => {
    fetch(`http://localhost:8000/notifications/${notificationId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications((prev) =>
            prev.filter((n) => n.notificationId !== notificationId)
          );
          toast.success("Notification deleted");
        }
      })
      .catch(() => toast.error("Failed to delete"));
  };

  const fetchNotifications = () => {
    fetch("http://localhost:8000/notifications", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications);
      })
      .catch((err) => {
        console.log(err);
        toast.error("An error occurred");
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <div className="navigation">
        <div className="navigation-links">
          <Link to="/about">About</Link>
          <Link to="/wall">The Wall</Link>
        </div>
        <div className="navigation-logo">
          <Link to="/">
            <Button.Icon style={{ cursor: "pointer", padding: 0 }}>
              <LuFlower size={32} />
            </Button.Icon>
          </Link>
        </div>
        <div className="navigation-buttons">
          <Button.Icon onClick={toggleTheme}>
            {theme === "light" ? (
              <LuSunMedium size={20} className="theme-icon" />
            ) : (
              <LuMoon size={20} className="theme-icon" />
            )}
          </Button.Icon>
          {!user && !isFetchingSession ? (
            <>
              <Button.Text>
                <Link to="/login">Login</Link>
              </Button.Text>
              <Button>
                <Link to="/register">Join</Link>
              </Button>
            </>
          ) : user && !isFetchingSession ? (
            <>
              <Button.Icon onClick={() => setCurrentDrawer("notifications")}>
                <LuBell size={20} />
              </Button.Icon>
              <Dropdown
                trigger={
                  <Button.Text>
                    Settings
                    <LuChevronDown style={{ marginLeft: "0.5rem" }} />
                  </Button.Text>
                }
              >
                <Dropdown.Item>
                  <LuUser size={16} />
                  <Link to="/profile">My Profile</Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <LuFileText size={16} />
                  <Link to="/terms-and-policies">Terms and Policies</Link>
                </Dropdown.Item>
                {user?.role === "Admin" && (
                  <>
                    <hr className="admin-controls-separator" />
                    <Dropdown.Item>
                      <LuAlarmClockCheck size={16} />
                      <Link to="/pending">Pending Posts</Link>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <LuUsers size={16} />
                      <Link to="/users-control-panel">Users Control</Link>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <LuTag size={16} />
                      <Link to="/tags-control-panel">Tags Control</Link>
                    </Dropdown.Item>
                  </>
                )}
                <hr />
                <Dropdown.Item
                  onClick={() => setCurrentDrawer("change-password")}
                >
                  <LuKey size={16} />
                  <p>Change Password</p>
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setCurrentDrawer("delete-account")}
                  destructive
                >
                  <LuTrash size={16} />
                  <p>Delete Account</p>
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  destructive
                >
                  <LuLogOut size={16} />
                  <p>Logout</p>
                </Dropdown.Item>
              </Dropdown>
            </>
          ) : (
            <LuLoaderCircle size={20} className="spin" />
          )}
        </div>
      </div>
      <Drawer
        isOpen={currentDrawer === "change-password"}
        onClose={() => {
          setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setPasswordErrors({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setCurrentDrawer(null);
        }}
        title="Change Password"
      >
        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            label="Current Password"
            type="password"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            errors={passwordErrors.currentPassword}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            errors={passwordErrors.newPassword}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            errors={passwordErrors.confirmPassword}
          />
          <Button
            type="button"
            onClick={handleChangePassword}
            disabled={isPasswordLoading}
          >
            Change Password
          </Button>
        </form>
      </Drawer>
      <Drawer
        isOpen={currentDrawer === "delete-account"}
        onClose={() => setCurrentDrawer(null)}
        title="Delete Account"
      >
        <p>
          Are you sure you want to delete your account? This is a permenant
          action and cannot be undone.
        </p>
        <form>
          <Input
            type="text"
            value={deleteAccountConfirmation}
            onChange={(e) => setDeleteAccountConfirmation(e.target.value)}
            style={{ marginBottom: "1rem" }}
            label="Enter your username to confirm"
            placeholder={`@${user?.username}`}
          />
          <Button.Destructive
            type="button"
            onClick={handleDeleteAccount}
            disabled={
              isDeleteLoading ||
              deleteAccountConfirmation !== `@${user?.username}`
            }
          >
            Delete Account
          </Button.Destructive>
        </form>
      </Drawer>
      <SideDrawer
        isOpen={currentDrawer === "notifications"}
        onClose={() => setCurrentDrawer(null)}
        title={`${notifications?.length || 0} Notifications`}
      >
        <div className="notifications-container">
          {notifications?.length > 0 && (
            <div className="notifications-actions">
              <Button.Text onClick={() => handleReadAllNotifications()}>
                Mark all as read
              </Button.Text>
            </div>
          )}

          {notifications?.length === 0 ? (
            <div className="notifications-empty">
              <LuBell size={48} className="notifications-empty-icon" />
              <p>No notifications yet</p>
              <span>You're all caught up!</span>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications?.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`notification-card ${
                    !notification.isMarkedRead ? "unread" : ""
                  }`}
                >
                  <div className="notification-card-content">
                    {!notification.isMarkedRead && (
                      <span className="notification-unread-dot" />
                    )}
                    <div className="notification-card-text">
                      <p className="notification-message">
                        {notification.content}
                      </p>
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()}
                        {" - "}
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <button
                    className="notification-delete-btn"
                    onClick={() =>
                      handleDeleteNotification(notification.notificationId)
                    }
                    title="Delete notification"
                  >
                    <LuX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SideDrawer>
    </>
  );
};

export default Navigation;
