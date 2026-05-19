import React from "react";
import { Link } from "react-router";
import { LuBookmark, LuScroll } from "react-icons/lu";
import { Button, SmallText } from "@/components";
import { assetUrl } from "@/config";

import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

/**
 * WallPostCard - Memoized component for individual post display
 * Follows rerender-memo pattern for optimization
 */
const WallPostCard = React.memo(function WallPostCard({
  post,
  user,
  onSavePost,
  onOpenProposal,
}) {
  const profileImage = post.profilePicture
    ? assetUrl(post.profilePicture)
    : post.gender === "Male"
      ? profileImage1
      : profileImage3;

  return (
    <div className="wall-post">
      <div className="wall-post-header">
        <div className="header-info">
          <div className="header-info-user-details">
            <img src={profileImage} alt="Profile picture" />
            <div>
              <h3>{`${post.firstName} ${post.lastName}`}</h3>
              <SmallText text={new Date(post.createdAt).toLocaleString()} />
            </div>
          </div>
        </div>
        <div className="header-info">
          <div className="header-info-column">
            <h4>
              {post.hourlyRate ? `$${post.hourlyRate}/hr` : `$${post.budget}`}
            </h4>
            <SmallText text={post.budget ? "Budget" : "Hourly Rate"} />
          </div>
          <div className="header-info-column">
            <h4>{post.proposalCount}</h4>
            <SmallText text="Proposals" />
          </div>
        </div>
      </div>
      <div className="wall-post-body">
        <h3>{post.jobTitle}</h3>
        <p>{post.jobDescription}</p>
        {post.jobThumbnail && (
          <img src={assetUrl(post.jobThumbnail)} alt="Job thumbnail" />
        )}
        {post.tags.length > 0 && (
          <div className="wall-post-tags">
            {post.tags.map((tag) => (
              <SmallText.Badge key={tag.tagId} text={tag.tagName} />
            ))}
          </div>
        )}
      </div>
      <hr />
      <div className="wall-post-actions">
        {user?.userId ? (
          <>
            <Button.Icon onClick={() => onSavePost(post.postId)}>
              <LuBookmark />
              Save Post
            </Button.Icon>
            {user.role !== "Client" && (
              <Button.Icon onClick={() => onOpenProposal(post.postId)}>
                <LuScroll />
                Submit Proposal
              </Button.Icon>
            )}
          </>
        ) : (
          <SmallText text="To perform any action, please ">
            <Link to="/login">Login</Link>
          </SmallText>
        )}
      </div>
    </div>
  );
});

export default WallPostCard;
