import "@/pages/Pending/Pending.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

import { useSession } from "@/contexts/SessionContext";
import { API_BASE_URL, assetUrl } from "@/config";
import {
  Navigation,
  Status,
  SmallText,
  Table,
  Button,
  Tooltip,
  Drawer,
  Input,
  Select,
} from "@/components";
import { toast } from "react-hot-toast";
import { LuCheck, LuX, LuBrush, LuImage } from "react-icons/lu";

import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

function Pending() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [currentPostId, setCurrentPostId] = useState();
  const [editPost, setEditPost] = useState({});
  const [openedDrawer, setOpenedDrawer] = useState(null);
  const [isDrawerButtonDisabled, setIsDrawerButtonDisabled] = useState(false);

  const fetchPosts = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/posts`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error("Error fetching posts");
        setIsLoading(false);
      });
  }, []);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setIsDrawerButtonDisabled(true);
    fetch(`${API_BASE_URL}/posts/${currentPostId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editPost),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          toast.success("Post updated successfully");
          setOpenedDrawer(null);
          fetchPosts();
        } else {
          toast.error("Failed to update post");
        }
      })
      .catch((error) => {
        toast.error("Error updating post:", error);
      })
      .finally(() => {
        setIsDrawerButtonDisabled(false);
      });
  };

  useEffect(() => {
    if (!user || user.role !== "Admin") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpdateStatus = useCallback((postId, status) => {
    fetch(`${API_BASE_URL}/admin/posts/${postId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          toast.success(`Post ${status.toLowerCase()} successfully`);
          setPosts((prev) => prev.filter((p) => p.postId !== postId));
        } else {
          toast.error(data.message || "Failed to update post status");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("An error occurred");
      });
  }, []);

  return (
    <>
      <Navigation />
      <div className="pending-container">
        {isLoading && (
          <Status
            text="Loading..."
            subtext="Please wait while we load the posts..."
          />
        )}
        {!isLoading && posts.length === 0 && (
          <Status.Error
            text="No posts found"
            subtext="There are no pending posts to display."
          />
        )}
        {!isLoading && posts.length > 0 && (
          <>
            <div className="posts-header">
              <h2>Pending posts</h2>
              <SmallText
                text={`Where you can manage the ${posts.length} pending posts`}
              />
            </div>
            <Table
              headers={[
                "User",
                "Title",
                "Description",
                "Budget/Rate",
                "Created At",
                "Actions",
              ]}
              rows={posts.map((post) => [
                <div className="user-info">
                  <img
                    src={
                      post.profilePicture
                        ? assetUrl(post.profilePicture)
                        : user?.gender === "Male"
                          ? profileImage1
                          : profileImage3
                    }
                    alt={post.username}
                    loading="lazy"
                  />
                  <div>
                    <p>{`${post.firstName} ${post.lastName}`}</p>
                    <SmallText text={`@${post.username}`} />
                  </div>
                </div>,
                post.jobTitle,
                post.jobDescription,
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span>
                    {!!post.hourlyRate
                      ? `$${post.hourlyRate}/hr`
                      : `$${post.budget}`}
                  </span>
                  <SmallText text={post.jobType} />
                </div>,
                new Date(post.createdAt).toDateString(),
                <div className="user-actions">
                  <Tooltip text="Approve">
                    <Button.Icon
                      onClick={() =>
                        handleUpdateStatus(post.postId, "Accepted")
                      }
                    >
                      <LuCheck size={16} className="text-green-500" />
                    </Button.Icon>
                  </Tooltip>
                  <Tooltip text="Reject">
                    <Button.Icon
                      onClick={() => handleUpdateStatus(post.postId, "Refused")}
                    >
                      <LuX size={16} className="text-red-500" />
                    </Button.Icon>
                  </Tooltip>
                  <Tooltip text="Edit">
                    <Button.Icon
                      onClick={() => {
                        setCurrentPostId(post.postId);
                        setOpenedDrawer("edit");
                      }}
                    >
                      <LuBrush size={16} />
                    </Button.Icon>
                  </Tooltip>
                  {post.jobThumbnail && (
                    <Tooltip text="View Image">
                      <Button.Icon
                        onClick={() => {
                          setCurrentPostId(post.postId);
                          setOpenedDrawer("view-image");
                        }}
                      >
                        <LuImage size={16} />
                      </Button.Icon>
                    </Tooltip>
                  )}
                </div>,
              ])}
            />
            <Drawer
              title="Edit post"
              isOpen={openedDrawer === "edit"}
              onClose={() => {
                setOpenedDrawer(null);
                setEditPost({});
              }}
            >
              <form
                onSubmit={handleEditSubmit}
                className="edit-post-form"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <Input
                  label="Job Title"
                  name="jobTitle"
                  onChange={(e) =>
                    setEditPost({ ...editPost, jobTitle: e.target.value })
                  }
                  defaultValue={
                    posts.find((p) => p.postId === currentPostId)?.jobTitle
                  }
                />
                <Input.TextArea
                  label="Description"
                  name="jobDescription"
                  onChange={(e) =>
                    setEditPost({ ...editPost, jobDescription: e.target.value })
                  }
                  defaultValue={
                    posts.find((p) => p.postId === currentPostId)
                      ?.jobDescription
                  }
                />
                <div className="form-row">
                  <Select
                    label="Payment Type"
                    options={["Fixed", "Hourly"]}
                    defaultValue={
                      posts.find((p) => p.postId === currentPostId)?.jobType
                    }
                    onChange={(e) =>
                      setEditPost({ ...editPost, jobType: e.target.value })
                    }
                  />
                  <Input
                    label={
                      editPost.jobType === "Hourly"
                        ? "Rate ($/hr)"
                        : "Budget ($)"
                    }
                    type="number"
                    step="0.01"
                    name={
                      editPost.jobType === "Hourly" ? "hourlyRate" : "budget"
                    }
                    defaultValue={
                      posts.find((p) => p.postId === currentPostId)?.jobType ===
                      "Hourly"
                        ? posts.find((p) => p.postId === currentPostId)
                            ?.hourlyRate
                        : posts.find((p) => p.postId === currentPostId)?.budget
                    }
                    onChange={(e) => {
                      if (editPost.jobType === "Hourly") {
                        setEditPost({
                          ...editPost,
                          hourlyRate: e.target.value,
                          budget: null,
                        });
                      } else {
                        setEditPost({
                          ...editPost,
                          budget: e.target.value,
                          hourlyRate: null,
                        });
                      }
                    }}
                  />
                </div>
                <Button type="submit" disabled={isDrawerButtonDisabled}>
                  Save Changes
                </Button>
              </form>
            </Drawer>
            <Drawer
              title="View Image"
              isOpen={openedDrawer === "view-image"}
              onClose={() => setOpenedDrawer(null)}
            >
              <img
                src={assetUrl(
                  posts.find((p) => p.postId === currentPostId)?.jobThumbnail,
                )}
                alt="Job Thumbnail"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </Drawer>
          </>
        )}
      </div>
    </>
  );
}

export default Pending;
