import React, { useCallback } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { Drawer, Input, Button } from "@/components";
import { API_BASE_URL } from "@/config";

/**
 * DeleteAccountDrawer - Explicit variant for account deletion
 * Follows patterns-explicit-variants pattern
 */
const DeleteAccountDrawer = React.memo(function DeleteAccountDrawer({
  isOpen,
  onClose,
  user,
  confirmation,
  setConfirmation,
  isLoading,
  setIsLoading,
}) {
  const navigate = useNavigate();

  const handleDeleteAccount = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const res = await fetch(`${API_BASE_URL}/auth/deleteAccount`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();

        if (data.status === 200) {
          toast.success("Account deleted successfully");
          onClose();
          navigate(0);
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
    [setIsLoading, onClose, navigate],
  );

  const handleConfirmationChange = useCallback(
    (e) => setConfirmation(e.target.value),
    [setConfirmation],
  );

  const isDeleteDisabled = isLoading || confirmation !== `@${user?.username}`;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Delete Account">
      <p>
        Are you sure you want to delete your account? This is a permanent action
        and cannot be undone.
      </p>
      <form>
        <Input
          type="text"
          value={confirmation}
          onChange={handleConfirmationChange}
          style={{ marginBottom: "1rem" }}
          label="Enter your username to confirm"
          placeholder={`@${user?.username}`}
        />
        <Button.Destructive
          type="button"
          onClick={handleDeleteAccount}
          disabled={isDeleteDisabled}
        >
          Delete Account
        </Button.Destructive>
      </form>
    </Drawer>
  );
});

export default DeleteAccountDrawer;
