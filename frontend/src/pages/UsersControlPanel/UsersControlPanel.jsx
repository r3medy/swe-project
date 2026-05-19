import "@/pages/UsersControlPanel/UsersControlPanel.css";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { LuPlus } from "react-icons/lu";

import {
  Button,
  Navigation,
  PaginationControls,
  SmallText,
  Status,
  Tooltip,
} from "@/components";
import { useSession } from "@/contexts/useSession";

import CreateUserDrawer from "./components/CreateUserDrawer";
import DeleteUserDrawer from "./components/DeleteUserDrawer";
import EditUserDrawer from "./components/EditUserDrawer";
import UserTable from "./components/UserTable";
import { useUsersControlPanel } from "./hooks/useUsersControlPanel";

function UsersControlPanel() {
  const { user } = useSession();
  const navigate = useNavigate();
  const {
    users,
    tags,
    isLoading,
    page,
    canLoadNextPage,
    currentDrawer,
    selectedUser,
    selectedTags,
    createUserForm,
    createUserErrors,
    setCurrentDrawer,
    closeDrawer,
    closeCreateUserDrawer,
    handlePageChange,
    handleEditUser,
    handleRequestDeleteUser,
    updateEditUserField,
    updateCreateUserField,
    handleEditUserSubmit,
    handleDeleteUser,
    handleCreateUserSubmit,
    handleToggleTag,
  } = useUsersControlPanel();

  useEffect(() => {
    if (!user || user.role !== "Admin") navigate("/");
  }, [user, navigate]);

  const openCreateUserDrawer = useCallback(() => {
    setCurrentDrawer("create-user");
  }, [setCurrentDrawer]);

  const handleViewUser = useCallback(
    (username) => navigate(`${window.location.origin}/profile/@${username}`),
    [navigate],
  );

  return (
    <>
      <Navigation />
      <div className="users-container">
        {isLoading ? (
          <Status text="Loading" subtext="Please wait while we load the users" />
        ) : users.length === 0 && page === 1 ? (
          <Status.Error
            text="No users"
            subtext="There are no users in the database"
          />
        ) : (
          <>
            <div className="users-header">
              <h2>
                <Tooltip text="Add user">
                  <Button.Icon onClick={openCreateUserDrawer}>
                    <LuPlus />
                  </Button.Icon>
                </Tooltip>
                Users control panel
              </h2>
              <SmallText text={`Showing page ${page} of your users`} />
            </div>
            <UserTable
              users={users}
              currentUser={user}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleRequestDeleteUser}
            />
            <PaginationControls
              page={page}
              hasNextPage={canLoadNextPage}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              label="Users"
            />
          </>
        )}
      </div>

      <EditUserDrawer
        isOpen={currentDrawer === "edit-user"}
        selectedUser={selectedUser}
        onClose={closeDrawer}
        onSubmit={handleEditUserSubmit}
        onChangeField={updateEditUserField}
      />
      <DeleteUserDrawer
        isOpen={currentDrawer === "delete-user"}
        selectedUser={selectedUser}
        onClose={closeDrawer}
        onDelete={handleDeleteUser}
      />
      <CreateUserDrawer
        isOpen={currentDrawer === "create-user"}
        form={createUserForm}
        errors={createUserErrors}
        tags={tags}
        selectedTags={selectedTags}
        onClose={closeCreateUserDrawer}
        onSubmit={handleCreateUserSubmit}
        onChangeField={updateCreateUserField}
        onToggleTag={handleToggleTag}
      />
    </>
  );
}

export default UsersControlPanel;
