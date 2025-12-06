import "@/pages/UsersControlPanel/UsersControlPanel.css";
import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";

import { LuExternalLink, LuTrash, LuBrush } from "react-icons/lu";

import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

import { useSession } from "@/contexts/SessionContext";
import {
  Navigation,
  Status,
  Table,
  SmallText,
  Button,
  Tooltip,
  Drawer,
  Input,
  Select,
} from "@/components";

function UsersControlPanel() {
  const { user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "Admin") navigate("/");
  }, [user, navigate]);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});

  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    fetch("http://localhost:8000/admin/users", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setCurrentDrawer("edit-user");
  }, []);

  const handleEditUserSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!selectedUser) return;

      fetch(`http://localhost:8000/admin/users/${selectedUser.userId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUserForm),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status !== 200) {
            toast.error(data.message || "Failed to update user");
          } else {
            // Update the local users state with the edited user data
            setUsers((prev) =>
              prev.map((u) =>
                u.userId === selectedUser.userId ? { ...u, ...editUserForm } : u
              )
            );
            toast.success("User updated successfully");
            setCurrentDrawer(null);
            setEditUserForm({});
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("An error occurred");
        });
    },
    [selectedUser, editUserForm]
  );

  const handleDeleteUser = useCallback(() => {
    if (!selectedUser) return;
    setCurrentDrawer(null);

    fetch(`http://localhost:8000/admin/users/${selectedUser.userId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status !== 200) {
          toast.error(data.message || "Failed to delete user");
        } else {
          setUsers((prev) =>
            prev.filter((u) => u.userId !== selectedUser.userId)
          );
          toast.success("User deleted successfully");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("An error occurred");
      });
  }, [selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <Navigation />
      <div className="users-container">
        {isLoading && (
          <Status
            text="Loading"
            subtext="Please wait while we load the users"
          />
        )}
        {!isLoading && users.length === 0 && (
          <Status.Error
            text="No users"
            subtext="There are no users in the database"
          />
        )}
        {!isLoading && users.length > 0 && (
          <>
            <div className="users-header">
              <h2>Users control panel</h2>
              <SmallText
                text={`Where you could manage your ${users.length} users and show your authority😉`}
              />
            </div>
            <Table
              headers={[
                "ID",
                "User",
                "Username",
                "Gender",
                "Role",
                "Created At",
                "Actions",
              ]}
              rows={users.map((userInfo) => [
                <SmallText text={userInfo.userId} />,
                <div className="user-info">
                  <img
                    src={
                      userInfo.profilePicture
                        ? `http://localhost:8000${userInfo.profilePicture}`
                        : userInfo.gender === "Male"
                        ? profileImage1
                        : profileImage3
                    }
                    alt={userInfo.username}
                    loading="lazy"
                  />
                  <div>
                    <p>{`${userInfo.firstName} ${userInfo.lastName}`}</p>
                    <SmallText text={userInfo.email} />
                  </div>
                </div>,
                <>
                  <p>
                    @{userInfo.username}{" "}
                    {userInfo.userId === user.userId && (
                      <SmallText text="(You)" />
                    )}
                  </p>
                </>,
                userInfo.gender,
                userInfo.role,
                new Date(userInfo.createdAt).toDateString(),
                <div className="user-actions">
                  <Tooltip text="View">
                    <Button.Icon
                      onClick={() =>
                        navigate(
                          `${window.location.origin}/profile/@${userInfo.username}`
                        )
                      }
                    >
                      <LuExternalLink size={16} />
                    </Button.Icon>
                  </Tooltip>
                  <Tooltip text="Edit">
                    <Button.Icon onClick={() => handleEditUser(userInfo)}>
                      <LuBrush size={16} />
                    </Button.Icon>
                  </Tooltip>
                  {userInfo.userId !== user.userId && (
                    <Tooltip text="Delete">
                      <Button.Icon
                        onClick={() => {
                          setSelectedUser(userInfo);
                          setCurrentDrawer("delete-user");
                        }}
                      >
                        <LuTrash size={16} />
                      </Button.Icon>
                    </Tooltip>
                  )}
                </div>,
              ])}
            />
          </>
        )}
      </div>

      <Drawer
        title="Edit user"
        isOpen={currentDrawer === "edit-user"}
        onClose={() => setCurrentDrawer(null)}
      >
        {selectedUser && (
          <form className="edit-user-form" onSubmit={handleEditUserSubmit}>
            <div className="form-row">
              <Input
                label="First Name"
                name="firstName"
                type="text"
                placeholder="First Name"
                defaultValue={selectedUser.firstName}
                onChange={(e) =>
                  setEditUserForm({
                    ...editUserForm,
                    firstName: e.target.value,
                  })
                }
              />
              <Input
                label="Last Name"
                name="lastName"
                type="text"
                placeholder="Last Name"
                defaultValue={selectedUser.lastName}
                onChange={(e) =>
                  setEditUserForm({
                    ...editUserForm,
                    lastName: e.target.value,
                  })
                }
              />
            </div>
            <Input
              label="Username"
              name="username"
              type="text"
              placeholder="Username"
              defaultValue={selectedUser.username}
              onChange={(e) =>
                setEditUserForm({
                  ...editUserForm,
                  username: e.target.value,
                })
              }
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Email"
              defaultValue={selectedUser.email}
              onChange={(e) =>
                setEditUserForm({
                  ...editUserForm,
                  email: e.target.value,
                })
              }
            />
            <Input
              label="Title"
              name="title"
              type="text"
              placeholder="Professional Title"
              defaultValue={selectedUser.title}
              onChange={(e) =>
                setEditUserForm({
                  ...editUserForm,
                  title: e.target.value,
                })
              }
            />
            <Select.Countries
              label="Country"
              name="country"
              defaultValue={selectedUser.country}
              onChange={(e) =>
                setEditUserForm({
                  ...editUserForm,
                  country: e.target.value,
                })
              }
            />
            <div className="form-row">
              <Select
                label="Role"
                name="role"
                options={["Admin", "Freelancer", "Client"]}
                defaultValue={selectedUser.role}
                onChange={(e) =>
                  setEditUserForm({
                    ...editUserForm,
                    role: e.target.value,
                  })
                }
              />
              <Select
                label="Gender"
                name="gender"
                options={["Male", "Female"]}
                defaultValue={selectedUser.gender}
                onChange={(e) =>
                  setEditUserForm({
                    ...editUserForm,
                    gender: e.target.value,
                  })
                }
              />
            </div>
            <Input.TextArea
              label="Bio"
              name="bio"
              placeholder="User bio"
              defaultValue={selectedUser.bio}
              onChange={(e) =>
                setEditUserForm({
                  ...editUserForm,
                  bio: e.target.value,
                })
              }
            />
            <div className="form-actions">
              <Button type="submit">Save Changes</Button>
              <Button.Text onClick={() => setCurrentDrawer(null)}>
                Cancel
              </Button.Text>
            </div>
          </form>
        )}
      </Drawer>
      <Drawer
        title="Delete user confirmation"
        isOpen={currentDrawer === "delete-user"}
        onClose={() => setCurrentDrawer(null)}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>@{selectedUser?.username}</strong>? This action cannot be
          undone.
        </p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <Button.Destructive onClick={handleDeleteUser}>
            Delete
          </Button.Destructive>
          <Button.Text onClick={() => setCurrentDrawer(null)}>
            Cancel
          </Button.Text>
        </div>
      </Drawer>
    </>
  );
}

export default UsersControlPanel;
