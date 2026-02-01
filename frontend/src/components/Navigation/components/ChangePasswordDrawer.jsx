import React, { useCallback } from "react";
import { toast } from "react-hot-toast";
import { Drawer, Input, Button } from "@/components";
import { changePasswordSchema } from "@/models/changepassword.zod";

const API_BASE_URL = "http://localhost:8000";

/**
 * ChangePasswordDrawer - Memoized component for password change drawer
 * Follows patterns-explicit-variants by being a dedicated drawer variant
 */
const ChangePasswordDrawer = React.memo(function ChangePasswordDrawer({
  isOpen,
  onClose,
  passwords,
  setPasswords,
  passwordErrors,
  setPasswordErrors,
  isLoading,
  setIsLoading,
  resetForm,
}) {
  const handleChangePassword = useCallback(
    async (e) => {
      e.preventDefault();
      const { success, error } = changePasswordSchema.safeParse(passwords);
      if (!success) {
        setPasswordErrors(error.flatten().fieldErrors);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/auth/changePassword`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwords),
        });
        const data = await res.json();

        if (data.status === 200) {
          toast.success("Password changed successfully");
          resetForm();
          onClose();
        } else {
          toast.error(data.message || data.error);
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [passwords, setPasswordErrors, setIsLoading, resetForm, onClose],
  );

  // Using functional setState for stable callbacks (rerender-functional-setstate)
  const handleCurrentPasswordChange = useCallback(
    (e) =>
      setPasswords((prev) => ({ ...prev, currentPassword: e.target.value })),
    [setPasswords],
  );

  const handleNewPasswordChange = useCallback(
    (e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value })),
    [setPasswords],
  );

  const handleConfirmPasswordChange = useCallback(
    (e) =>
      setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value })),
    [setPasswords],
  );

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Input
          label="Current Password"
          type="password"
          placeholder="Current Password"
          value={passwords.currentPassword}
          onChange={handleCurrentPasswordChange}
          errors={passwordErrors.currentPassword}
        />
        <Input
          label="New Password"
          type="password"
          placeholder="New Password"
          value={passwords.newPassword}
          onChange={handleNewPasswordChange}
          errors={passwordErrors.newPassword}
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Confirm New Password"
          value={passwords.confirmPassword}
          onChange={handleConfirmPasswordChange}
          errors={passwordErrors.confirmPassword}
        />
        <Button
          type="button"
          onClick={handleChangePassword}
          disabled={isLoading}
        >
          Change Password
        </Button>
      </form>
    </Drawer>
  );
});

export default ChangePasswordDrawer;
