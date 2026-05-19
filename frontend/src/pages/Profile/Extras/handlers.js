import toast from "react-hot-toast";
import { post, postForm } from "@/utils/request";

export const handleApplyChanges = (changes, setIsLoading, setChanges) => {
  setIsLoading(true);
  post("/profile", changes)
    .then((data) => {
      if (data.success) {
        toast.success("Profile updated successfully");
        setChanges([]);
        window.location.reload();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    })
    .finally(() => {
      setIsLoading(false);
    });
};

export const handleCancelChanges = (setProfile, backupProfile, setChanges) => {
  setProfile(backupProfile);
  setChanges([]);
};

export const handleShareProfile = (e, profile) => {
  e.preventDefault();
  navigator.clipboard.writeText(
    `${window.location.origin}/profile/@${profile.username}`,
  );
  toast.success("Profile link copied to clipboard");
};

export const handleRemoveTag = (tagId, profile, setProfile, setChanges) => {
  const newTags = profile.tags.filter((tag) => tag.tagId !== tagId);
  setChanges((prev) => [...prev, { type: "remove-tag", tagId }]);
  setProfile({ ...profile, tags: newTags });
};

export const handleAddTag = (
  tags,
  selectRef,
  profile,
  setProfile,
  setChanges,
  setDrawerOpen,
) => {
  const selectedTag = tags.find(
    (tag) => tag.tagName === selectRef.current.value,
  );
  if (selectedTag) {
    setProfile({
      ...profile,
      tags: [...profile.tags, selectedTag],
    });
    setChanges((prev) => [
      ...prev,
      { type: "add-tag", tagId: selectedTag.tagId },
    ]);
  }
  setDrawerOpen(null);
};

export const handleChangeTitle = (
  profile,
  setProfile,
  setChanges,
  setDrawerOpen,
) => {
  setChanges((prev) => [
    ...prev,
    { type: "change-title", title: profile.title ?? "" },
  ]);
  setProfile({
    ...profile,
    title: profile.title ?? "",
  });
  setDrawerOpen(null);
};

export const handleRemoveSavedPost = (postId, setProfile, setChanges) => {
  setProfile((prev) => ({
    ...prev,
    savedPosts: prev.savedPosts.filter((post) => post.postId !== postId),
  }));
  setChanges((prev) => [...prev, { type: "remove-saved-post", postId }]);
};

export const handleChangeProfilePicture = (file, setProfile, setIsLoading) => {
  setIsLoading(true);

  // Create FormData for file upload
  const formData = new FormData();
  formData.append("profilePicture", file);

  postForm("/profile/uploadPicture", formData)
    .then((data) => {
      if (data.success) {
        toast.success("Profile picture updated successfully, refreshing page");
        setProfile((prev) => ({ ...prev, profilePicture: data.url }));
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to update profile picture");
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    })
    .finally(() => {
      setIsLoading(false);
    });
};

export const handleDeletePost = (postId, setProfile, setChanges) => {
  setProfile((prev) => ({
    ...prev,
    clientPosts: prev.clientPosts.filter((post) => post.postId !== postId),
  }));
  setChanges((prev) => [...prev, { type: "delete-post", postId }]);
};
