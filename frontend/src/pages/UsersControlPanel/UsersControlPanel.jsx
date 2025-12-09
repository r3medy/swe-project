import "@/pages/UsersControlPanel/UsersControlPanel.css";
import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";

import { LuExternalLink, LuTrash, LuBrush, LuPlus } from "react-icons/lu";

import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

import { useSession } from "@/contexts/SessionContext";
import { createUserSchema } from "@/models/createuser.zod";
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
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [createUserForm, setCreateUserForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    title: "",
    country: "",
    role: "",
    gender: "",
    bio: "",
  });
  const [createUserErrors, setCreateUserErrors] = useState({});

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

  const fetchTags = useCallback(() => {
    fetch("http://localhost:8000/tags")
      .then((res) => res.json())
      .then((data) => setTags(data))
      .catch((err) => console.log(err));
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

  const handleCreateUserSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setCreateUserErrors({});

      const validation = createUserSchema.safeParse(createUserForm);
      if (!validation.success) {
        setCreateUserErrors(validation.error.flatten().fieldErrors);
        return;
      }

      fetch("http://localhost:8000/admin/users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createUserForm,
          interests: selectedTags
            .map((tagId) => tags.find((t) => t.tagId === tagId)?.tagName)
            .filter(Boolean),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status !== 200) {
            toast.error(data.message || "Failed to create user");
          } else {
            toast.success("User created successfully");
            setCurrentDrawer(null);
            setCreateUserForm({
              firstName: "",
              lastName: "",
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
              title: "",
              country: "",
              role: "",
              gender: "",
              bio: "",
            });
            setSelectedTags([]);
            setCreateUserErrors({});
            fetchUsers();
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("An error occurred");
        });
    },
    [createUserForm, selectedTags, tags, fetchUsers]
  );

  const handleToggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  useEffect(() => {
    fetchUsers();
    fetchTags();
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
              <h2>
                <Tooltip text="Add user">
                  <Button.Icon onClick={() => setCurrentDrawer("create-user")}>
                    <LuPlus />
                  </Button.Icon>
                </Tooltip>
                Users control panel
              </h2>
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
      <Drawer
        title="Create user"
        isOpen={currentDrawer === "create-user"}
        onClose={() => {
          setCurrentDrawer(null);
          setCreateUserErrors({});
          setSelectedTags([]);
        }}
      >
        <form className="edit-user-form" onSubmit={handleCreateUserSubmit}>
          <div className="form-row">
            <Input
              label="First Name"
              name="firstName"
              type="text"
              placeholder="First Name"
              value={createUserForm.firstName}
              onChange={(e) =>
                setCreateUserForm({
                  ...createUserForm,
                  firstName: e.target.value,
                })
              }
              errors={createUserErrors.firstName}
            />
            <Input
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={createUserForm.lastName}
              onChange={(e) =>
                setCreateUserForm({
                  ...createUserForm,
                  lastName: e.target.value,
                })
              }
              errors={createUserErrors.lastName}
            />
          </div>
          <Input
            label="Username"
            name="username"
            type="text"
            placeholder="Username"
            value={createUserForm.username}
            onChange={(e) =>
              setCreateUserForm({
                ...createUserForm,
                username: e.target.value,
              })
            }
            errors={createUserErrors.username}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Email"
            value={createUserForm.email}
            onChange={(e) =>
              setCreateUserForm({
                ...createUserForm,
                email: e.target.value,
              })
            }
            errors={createUserErrors.email}
          />
          <div className="form-row">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Password"
              value={createUserForm.password}
              onChange={(e) =>
                setCreateUserForm({
                  ...createUserForm,
                  password: e.target.value,
                })
              }
              errors={createUserErrors.password}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={createUserForm.confirmPassword}
              onChange={(e) =>
                setCreateUserForm({
                  ...createUserForm,
                  confirmPassword: e.target.value,
                })
              }
              errors={createUserErrors.confirmPassword}
            />
          </div>
          <Input
            label="Title"
            name="title"
            type="text"
            placeholder="Professional Title"
            value={createUserForm.title}
            onChange={(e) =>
              setCreateUserForm({
                ...createUserForm,
                title: e.target.value,
              })
            }
            errors={createUserErrors.title}
          />
          <Select.Countries
            label="Country"
            name="country"
            value={createUserForm.country}
            onChange={(e) =>
              setCreateUserForm({
                ...createUserForm,
                country: e.target.value,
              })
            }
            errors={createUserErrors.country}
          />
          <div className="form-row">
            <Select
              label="Role"
              name="role"
              options={["Admin", "Freelancer", "Client"]}
              value={createUserForm.role}
              onChange={(e) =>
                setCreateUserForm({
                  ...createUserForm,
                  role: e.target.value,
                })
              }
              errors={createUserErrors.role}
            >
              <option value="">Select role</option>
              <option value="Admin">Admin</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Client">Client</option>
            </Select>
            <Select
              label="Gender"
              name="gender"
              options={["Male", "Female"]}
              value={createUserForm.gender}
              onChange={(e) =>
                setCreateUserForm({
                  ...createUserForm,
                  gender: e.target.value,
                })
              }
              errors={createUserErrors.gender}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </div>
          <Input.TextArea
            label="Bio"
            name="bio"
            placeholder="User bio"
            value={createUserForm.bio}
            onChange={(e) =>
              setCreateUserForm({
                ...createUserForm,
                bio: e.target.value,
              })
            }
            errors={createUserErrors.bio}
          />
          <div className="tags-section">
            <label>Tags</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {tags.map((tag) => (
                <SmallText.ClickableBadge
                  key={tag.tagId}
                  text={tag.tagName}
                  isClicked={selectedTags.includes(tag.tagId)}
                  onClick={() => handleToggleTag(tag.tagId)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
            {tags.length === 0 && <SmallText text="No tags available" />}
          </div>
          <div className="form-actions">
            <Button type="submit">Create User</Button>
            <Button.Text
              type="button"
              onClick={() => {
                setCurrentDrawer(null);
                setCreateUserErrors({});
                setSelectedTags([]);
              }}
            >
              Cancel
            </Button.Text>
          </div>
        </form>
      </Drawer>
    </>
  );
}

export default UsersControlPanel;
