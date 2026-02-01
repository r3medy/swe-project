import {
  LuTimer,
  LuBadgeDollarSign,
  LuBookDashed,
  LuCalendar1,
  LuX,
} from "react-icons/lu";
import { Tooltip, Button, SmallText } from "@/components";
import { handleRemoveSavedPost, handleDeletePost } from "../Extras/handlers";

const PostCard = ({ post, setProfile, setChanges, postType, isOwner }) => {
  return (
    <div className="post-card">
      <h3>
        {post.title}
        {isOwner && (
          <Tooltip
            text={postType === "saved" ? "Remove from saved" : "Delete post"}
          >
            <Button.Icon
              onClick={(e) =>
                postType === "saved"
                  ? handleRemoveSavedPost(post.postId, setProfile, setChanges)
                  : handleDeletePost(post.postId, setProfile, setChanges)
              }
            >
              <LuX />
            </Button.Icon>
          </Tooltip>
        )}
      </h3>
      <SmallText text={post.description} />
      {post.jobThumbnail && (
        <img
          src={`http://localhost:8000${post.jobThumbnail}`}
          alt="Job Thumbnail"
          loading="lazy"
          style={{
            maxWidth: "100%",
            maxHeight: "200px",
            borderRadius: "12px",
            objectFit: "cover",
            marginTop: "0.5rem",
          }}
        />
      )}
      <div className="post-footer">
        {!!post.hourlyRate ? (
          <Tooltip text="Hourly Rate">
            <div className="post-metric">
              <LuTimer />
              <span>${post.hourlyRate}/hr</span>
            </div>
          </Tooltip>
        ) : (
          <Tooltip text="Budget">
            <div className="post-metric">
              <LuBadgeDollarSign />
              <span>${post.budget}</span>
            </div>
          </Tooltip>
        )}
        <Tooltip text="Status">
          <div className="post-metric">
            <LuBookDashed />
            <span>{post.status}</span>
          </div>
        </Tooltip>
        <Tooltip text="Posted at">
          <div className="post-metric">
            <LuCalendar1 />
            <span>{new Date(post.createdAt).toDateString()}</span>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default PostCard;
