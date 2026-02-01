export const fetchProfile = async (
  profileQuery,
  setProfile,
  setBackupProfile,
) => {
  try {
    const response = await fetch(
      `http://localhost:8000/profile/${profileQuery ?? ""}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      setProfile(null);
      return null;
    }
    const data = await response.json();
    if (!data?.user) {
      setProfile(null);
      return null;
    }
    setProfile(data.user);
    setBackupProfile(data.user);
    return data.user;
  } catch (err) {
    return null;
  }
};

export const fetchTags = async (setTags) => {
  try {
    const response = await fetch(`http://localhost:8000/tags`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setTags(data);
  } catch (err) {}
};

export const fetchSavedPosts = async (setProfile, setBackupProfile) => {
  try {
    const response = await fetch(`http://localhost:8000/profile/savedPosts`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setProfile((prev) =>
      prev ? { ...prev, savedPosts: data?.savedPosts } : null,
    );
    setBackupProfile((prev) =>
      prev ? { ...prev, savedPosts: data?.savedPosts } : null,
    );
  } catch (err) {
    console.error(err);
  }
};

export const fetchPosts = async (
  profileQuery,
  setProfile,
  setBackupProfile,
) => {
  try {
    const response = await fetch(
      `http://localhost:8000/profile/clientPosts/${profileQuery ?? ""}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    setProfile((prev) =>
      prev ? { ...prev, clientPosts: data?.clientPosts } : null,
    );
    setBackupProfile((prev) =>
      prev ? { ...prev, clientPosts: data?.clientPosts } : null,
    );
  } catch (err) {}
};
