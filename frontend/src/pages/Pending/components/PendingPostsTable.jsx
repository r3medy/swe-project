import { LuCheck, LuX, LuBrush, LuImage } from "react-icons/lu";

import { Button, SmallText, Table, Tooltip } from "@/components";
import { assetUrl } from "@/config";
import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

function PendingPostsTable({
  posts,
  currentUser,
  onUpdateStatus,
  onOpenEdit,
  onOpenImage,
}) {
  return (
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
                : currentUser?.gender === "Male"
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
            {post.hourlyRate ? `$${post.hourlyRate}/hr` : `$${post.budget}`}
          </span>
          <SmallText text={post.jobType} />
        </div>,
        new Date(post.createdAt).toDateString(),
        <div className="user-actions">
          <Tooltip text="Approve">
            <Button.Icon onClick={() => onUpdateStatus(post.postId, "Accepted")}>
              <LuCheck size={16} className="text-green-500" />
            </Button.Icon>
          </Tooltip>
          <Tooltip text="Reject">
            <Button.Icon onClick={() => onUpdateStatus(post.postId, "Refused")}>
              <LuX size={16} className="text-red-500" />
            </Button.Icon>
          </Tooltip>
          <Tooltip text="Edit">
            <Button.Icon onClick={() => onOpenEdit(post.postId)}>
              <LuBrush size={16} />
            </Button.Icon>
          </Tooltip>
          {post.jobThumbnail ? (
            <Tooltip text="View Image">
              <Button.Icon onClick={() => onOpenImage(post.postId)}>
                <LuImage size={16} />
              </Button.Icon>
            </Tooltip>
          ) : null}
        </div>,
      ])}
    />
  );
}

export default PendingPostsTable;
