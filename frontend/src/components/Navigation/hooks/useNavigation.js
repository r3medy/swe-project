import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { get, post, del } from "@/utils/request";
import { buildPaginatedPath, hasNextPage } from "@/utils/pagination";

const NOTIFICATIONS_PAGE_SIZE = 20;

export function useNavigation() {
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsPage, setNotificationsPage] = useState(1);

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

  const fetchNotifications = useCallback(async (pageToFetch = 1) => {
    try {
      const data = await get(
        buildPaginatedPath("/notifications", {
          page: pageToFetch,
          limit: NOTIFICATIONS_PAGE_SIZE,
        }),
      );
      setNotifications(data.notifications || []);
      setNotificationsPage(pageToFetch);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred fetching notifications");
    }
  }, []);

  const handleNotificationsPageChange = useCallback(
    (nextPage) => {
      if (nextPage < 1) return;
      fetchNotifications(nextPage);
    },
    [fetchNotifications],
  );

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const data = await post("/notifications/markallread");
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
      const data = await del(`/notifications/${notificationId}`);
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

  const hasUnreadNotifications = useMemo(
    () => notifications?.some((n) => !n.isMarkedRead),
    [notifications],
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  return {
    // Drawer state
    currentDrawer,
    setCurrentDrawer,

    // Notifications
    notifications,
    notificationsPage,
    canLoadNextNotificationsPage: hasNextPage(
      notifications,
      NOTIFICATIONS_PAGE_SIZE,
    ),
    hasUnreadNotifications,
    handleNotificationsPageChange,
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
