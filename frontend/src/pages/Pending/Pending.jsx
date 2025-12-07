import "@/pages/Pending/Pending.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

import { useSession } from "@/contexts/SessionContext";
import {
  Navigation,
  Status,
  SmallText,
  Table,
  Button,
  Tooltip,
} from "@/components";
import { toast } from "react-hot-toast";
import { LuCheck, LuX, LuBrush } from "react-icons/lu";

import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

function Pending() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const fetchPosts = useCallback(() => {
    fetch("http://localhost:8000/admin/posts", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error("Error fetching posts:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user || user.role !== "Admin") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpdateStatus = useCallback((postId, status) => {
    fetch(`http://localhost:8000/admin/posts/${postId}`, {
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
                        ? `http://localhost:8000${post.profilePicture}`
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
                    {post.budget ? `$${post.budget}` : `$${post.hourlyRate}/hr`}
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
                    <Button.Icon onClick={() => toast("Edit not implemented")}>
                      <LuBrush size={16} />
                    </Button.Icon>
                  </Tooltip>
                </div>,
              ])}
            />
          </>
        )}
      </div>
    </>
  );
}

export default Pending;
