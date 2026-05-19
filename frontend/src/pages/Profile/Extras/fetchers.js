import { get } from "@/utils/request";

export const fetchProfile = async (
  profileQuery,
  setProfile,
  setBackupProfile,
) => {
  try {
    const data = await get(`/profile/${profileQuery ?? ""}`);
    if (!data?.user) {
      setProfile(null);
      return null;
    }
    setProfile(data.user);
    setBackupProfile(data.user);
    return data.user;
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    setProfile(null);
    return null;
  }
};

export const fetchTags = async (setTags) => {
  try {
    const data = await get(`/tags`);
    setTags(data ?? []);
  } catch (err) {
    console.error("Failed to fetch tags:", err);
    setTags([]);
  }
};

export const fetchSavedPosts = async (setProfile, setBackupProfile) => {
  try {
    const data = await get(`/profile/saved`);
    setProfile((prev) =>
      prev ? { ...prev, savedPosts: data?.savedPosts } : null,
    );
    setBackupProfile((prev) =>
      prev ? { ...prev, savedPosts: data?.savedPosts } : null,
    );
  } catch (err) {
    console.error("Failed to fetch saved posts:", err);
  }
};

export const fetchPosts = async (
  profileQuery,
  setProfile,
  setBackupProfile,
) => {
  try {
    const data = await get(`/profile/clientPosts/${profileQuery ?? ""}`);
    setProfile((prev) =>
      prev ? { ...prev, clientPosts: data?.clientPosts } : null,
    );
    setBackupProfile((prev) =>
      prev ? { ...prev, clientPosts: data?.clientPosts } : null,
    );
  } catch (err) {
    console.error("Failed to fetch posts:", err);
  }
};
