import { Button, Drawer } from "@/components";

function DeleteUserDrawer({ isOpen, selectedUser, onClose, onDelete }) {
  return (
    <Drawer title="Delete user confirmation" isOpen={isOpen} onClose={onClose}>
      <p>
        Are you sure you want to delete{" "}
        <strong>@{selectedUser?.username}</strong>? This action cannot be
        undone.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Button.Destructive onClick={onDelete}>Delete</Button.Destructive>
        <Button.Text onClick={onClose}>Cancel</Button.Text>
      </div>
    </Drawer>
  );
}

export default DeleteUserDrawer;
