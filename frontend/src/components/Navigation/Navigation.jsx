import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router";
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
  LuScroll,
  LuMessageSquareMore,
} from "react-icons/lu";

import "@/components/Navigation/Navigation.css";
import { Button, Dropdown, SideDrawer } from "@/components";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "@/contexts/SessionContext";
import { useNavigation } from "./hooks/useNavigation";

import NotificationsList from "./components/NotificationsList";
import ChangePasswordDrawer from "./components/ChangePasswordDrawer";
import DeleteAccountDrawer from "./components/DeleteAccountDrawer";

/**
 * Navigation component - refactored following composition patterns
 * - Extracted sub-components for drawer variants (patterns-explicit-variants)
 * - Using useCallback for stable event handlers (rerender-functional-setstate)
 * - Memoized derived state via useMemo in useNavigation hook
 */
const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isFetchingSession, logout } = useSession();
  const navigate = useNavigate();

  const {
    currentDrawer,
    setCurrentDrawer,
    notifications,
    hasUnreadNotifications,
    markAllNotificationsRead,
    deleteNotification,
    passwords,
    setPasswords,
    passwordErrors,
    setPasswordErrors,
    isPasswordLoading,
    setIsPasswordLoading,
    resetPasswordForm,
    deleteAccountConfirmation,
    setDeleteAccountConfirmation,
    isDeleteLoading,
    setIsDeleteLoading,
  } = useNavigation();

  // Stable callbacks using useCallback (rerender-functional-setstate)
  const openChangePassword = useCallback(
    () => setCurrentDrawer("change-password"),
    [setCurrentDrawer],
  );

  const openDeleteAccount = useCallback(
    () => setCurrentDrawer("delete-account"),
    [setCurrentDrawer],
  );

  const openNotifications = useCallback(
    () => setCurrentDrawer("notifications"),
    [setCurrentDrawer],
  );

  const closeDrawer = useCallback(
    () => setCurrentDrawer(null),
    [setCurrentDrawer],
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

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

          {/* Early return pattern - check conditions explicitly */}
          {isFetchingSession ? (
            <LuLoaderCircle size={20} className="spin" />
          ) : !user ? (
            <>
              <Button.Text>
                <Link to="/login">Login</Link>
              </Button.Text>
              <Button>
                <Link to="/register">Join</Link>
              </Button>
            </>
          ) : (
            <>
              <Button.Icon onClick={openNotifications}>
                <LuBell
                  size={20}
                  style={{
                    color: hasUnreadNotifications ? "var(--accent)" : undefined,
                  }}
                />
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
                  <LuMessageSquareMore size={16} />
                  <Link to="/chat">My Chats</Link>
                </Dropdown.Item>
                {user.role !== "Freelancer" && (
                  <Dropdown.Item>
                    <LuScroll size={16} />
                    <Link to="/proposals">My Proposals</Link>
                  </Dropdown.Item>
                )}
                <Dropdown.Item>
                  <LuFileText size={16} />
                  <Link to="/terms-and-policies">Terms and Policies</Link>
                </Dropdown.Item>
                {user.role === "Admin" && (
                  <>
                    <hr />
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
                <Dropdown.Item onClick={openChangePassword}>
                  <LuKey size={16} />
                  <p>Change Password</p>
                </Dropdown.Item>
                <Dropdown.Item onClick={openDeleteAccount} destructive>
                  <LuTrash size={16} />
                  <p>Delete Account</p>
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout} destructive>
                  <LuLogOut size={16} />
                  <p>Logout</p>
                </Dropdown.Item>
              </Dropdown>
            </>
          )}
        </div>
      </div>

      {/* Explicit variant components for drawers */}
      <ChangePasswordDrawer
        isOpen={currentDrawer === "change-password"}
        onClose={closeDrawer}
        passwords={passwords}
        setPasswords={setPasswords}
        passwordErrors={passwordErrors}
        setPasswordErrors={setPasswordErrors}
        isLoading={isPasswordLoading}
        setIsLoading={setIsPasswordLoading}
        resetForm={resetPasswordForm}
      />

      <DeleteAccountDrawer
        isOpen={currentDrawer === "delete-account"}
        onClose={closeDrawer}
        user={user}
        confirmation={deleteAccountConfirmation}
        setConfirmation={setDeleteAccountConfirmation}
        isLoading={isDeleteLoading}
        setIsLoading={setIsDeleteLoading}
      />

      <SideDrawer
        isOpen={currentDrawer === "notifications"}
        onClose={closeDrawer}
        title={`${notifications?.length || 0} Notifications`}
      >
        <div className="notifications-container">
          <NotificationsList
            notifications={notifications}
            onMarkAllRead={markAllNotificationsRead}
            onDeleteNotification={deleteNotification}
          />
        </div>
      </SideDrawer>
    </>
  );
};

export default Navigation;
