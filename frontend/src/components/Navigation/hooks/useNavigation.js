import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "@/config";

/**
 * Custom hook to manage navigation-related state
 * Follows state-decouple-implementation pattern
 */
export function useNavigation() {
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Password change state
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

  // Delete account state
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] =
    useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const resetPasswordForm = useCallback(() => {
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
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred fetching notifications");
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/markallread`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isMarkedRead: 1 })),
        );
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark as read");
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.filter((n) => n.notificationId !== notificationId),
        );
        toast.success("Notification deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }, []);

  // Derived state - notifications that are unread
  const hasUnreadNotifications = useMemo(
    () => notifications?.some((n) => !n.isMarkedRead),
    [notifications],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    // Drawer state
    currentDrawer,
    setCurrentDrawer,

    // Notifications
    notifications,
    hasUnreadNotifications,
    markAllNotificationsRead,
    deleteNotification,

    // Password change
    passwords,
    setPasswords,
    passwordErrors,
    setPasswordErrors,
    isPasswordLoading,
    setIsPasswordLoading,
    resetPasswordForm,

    // Delete account
    deleteAccountConfirmation,
    setDeleteAccountConfirmation,
    isDeleteLoading,
    setIsDeleteLoading,
  };
}
