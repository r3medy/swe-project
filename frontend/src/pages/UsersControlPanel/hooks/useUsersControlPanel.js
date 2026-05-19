import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { createUserSchema } from "@/models/createuser.zod";
import { get, post, put, del } from "@/utils/request";
import { buildPaginatedPath, hasNextPage } from "@/utils/pagination";

const USERS_PAGE_SIZE = 20;
const TAGS_SELECT_LIMIT = 50;

const EMPTY_CREATE_USER_FORM = {
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
};

export function useUsersControlPanel() {
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [createUserForm, setCreateUserForm] = useState(EMPTY_CREATE_USER_FORM);
  const [createUserErrors, setCreateUserErrors] = useState({});

  const fetchUsers = useCallback(async (pageToFetch = 1) => {
    try {
      setIsLoading(true);
      const data = await get(
        buildPaginatedPath("/admin/users", {
          page: pageToFetch,
          limit: USERS_PAGE_SIZE,
        }),
      );
      setUsers(data);
      setPage(pageToFetch);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const data = await get(
        buildPaginatedPath("/tags", { page: 1, limit: TAGS_SELECT_LIMIT }),
      );
      setTags(data);
    } catch (err) {
      console.error(err);
      setTags([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
    fetchTags();
  }, [fetchUsers, fetchTags]);

  const handlePageChange = useCallback(
    (nextPage) => {
      if (nextPage < 1) return;
      fetchUsers(nextPage);
    },
    [fetchUsers],
  );

  const closeDrawer = useCallback(() => {
    setCurrentDrawer(null);
  }, []);

  const closeCreateUserDrawer = useCallback(() => {
    setCurrentDrawer(null);
    setCreateUserErrors({});
    setSelectedTags([]);
  }, []);

  const handleEditUser = useCallback((userInfo) => {
    setSelectedUser(userInfo);
    setCurrentDrawer("edit-user");
  }, []);

  const handleRequestDeleteUser = useCallback((userInfo) => {
    setSelectedUser(userInfo);
    setCurrentDrawer("delete-user");
  }, []);

  const updateEditUserField = useCallback((key, value) => {
    setEditUserForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateCreateUserField = useCallback((key, value) => {
    setCreateUserForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleEditUserSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!selectedUser) return;

      put(`/admin/users/${selectedUser.userId}`, editUserForm)
        .then((data) => {
          if (data.status !== 200) {
            toast.error(data.message || "Failed to update user");
            return;
          }

          setUsers((prev) =>
            prev.map((userInfo) =>
              userInfo.userId === selectedUser.userId
                ? { ...userInfo, ...editUserForm }
                : userInfo,
            ),
          );
          toast.success("User updated successfully");
          setCurrentDrawer(null);
          setEditUserForm({});
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message || "An error occurred");
        });
    },
    [selectedUser, editUserForm],
  );

  const handleDeleteUser = useCallback(() => {
    if (!selectedUser) return;
    setCurrentDrawer(null);

    del(`/admin/users/${selectedUser.userId}`)
      .then((data) => {
        if (data.status !== 200) {
          toast.error(data.message || "Failed to delete user");
          return;
        }

        setUsers((prev) =>
          prev.filter((userInfo) => userInfo.userId !== selectedUser.userId),
        );
        toast.success("User deleted successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || "An error occurred");
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

      post("/admin/users", {
        ...createUserForm,
        interests: selectedTags
          .map((tagId) => tags.find((tag) => tag.tagId === tagId)?.tagName)
          .filter(Boolean),
      })
        .then((data) => {
          if (data.status !== 200) {
            toast.error(data.message || "Failed to create user");
            return;
          }

          toast.success("User created successfully");
          setCurrentDrawer(null);
          setCreateUserForm(EMPTY_CREATE_USER_FORM);
          setSelectedTags([]);
          setCreateUserErrors({});
          fetchUsers(1);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message || "An error occurred");
        });
    },
    [createUserForm, selectedTags, tags, fetchUsers],
  );

  const handleToggleTag = useCallback((tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }, []);

  return {
    users,
    tags,
    isLoading,
    page,
    canLoadNextPage: hasNextPage(users, USERS_PAGE_SIZE),
    currentDrawer,
    selectedUser,
    editUserForm,
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
  };
}
