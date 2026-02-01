import {
  LuPenLine,
  LuCamera,
  LuShare2,
  LuCalendar1,
  LuUser,
  LuPlus,
} from "react-icons/lu";
import ReactCountryFlag from "react-country-flag";
import { Tooltip, Button, SmallText } from "@/components";
import { handleShareProfile, handleRemoveTag } from "../Extras/handlers";
import PostCard from "./PostCard";
import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

const ProfileCard = ({
  profile,
  setProfile,
  setChanges,
  user,
  setDrawerOpen,
}) => {
  return (
    <>
      <div className="profile-header">
        <div className="header-info">
          <div className="header-details">
            <img
              src={
                profile.profilePicture
                  ? `http://localhost:8000${profile.profilePicture}`
                  : profile.gender === "Male"
                    ? profileImage1
                    : profileImage3
              }
              alt="Profile Image"
              loading="lazy"
            />
            <div className="header-text">
              <h1>
                <ReactCountryFlag
                  countryCode={profile.country}
                  className="country-flag"
                />
                {`${profile.firstName} ${profile.lastName}`}
              </h1>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {profile.title}
                {user?.userId == profile?.userId && (
                  <Tooltip text="Edit title">
                    <Button.Icon onClick={() => setDrawerOpen("change-title")}>
                      <LuPenLine />
                    </Button.Icon>
                  </Tooltip>
                )}
              </div>
              <SmallText text={`@${profile.username}`} />
            </div>
          </div>
          <div className="header-actions">
            {user?.userId == profile?.userId && (
              <Tooltip text="Change profile picture">
                <Button.Icon
                  onClick={() => setDrawerOpen("change-profile-picture")}
                >
                  <LuCamera />
                </Button.Icon>
              </Tooltip>
            )}
            <Tooltip text="Share your profile">
              <Button.Icon onClick={(e) => handleShareProfile(e, profile)}>
                <LuShare2 />
              </Button.Icon>
            </Tooltip>
            <Tooltip
              text={"Joined " + new Date(profile.createdAt).toDateString()}
            >
              <Button.Icon>
                <LuCalendar1 />
              </Button.Icon>
            </Tooltip>
            <Tooltip text={profile.role}>
              <Button.Icon>
                <LuUser />
              </Button.Icon>
            </Tooltip>
          </div>
        </div>
        <div className="profile-content">
          <h1>
            About Me
            {user?.userId == profile?.userId && (
              <Tooltip text="Edit about me">
                <Button.Icon onClick={() => setDrawerOpen("edit-bio")}>
                  <LuPenLine />
                </Button.Icon>
              </Tooltip>
            )}
          </h1>
          <p>{profile.bio}</p>
        </div>
        <div className="profile-content">
          <h1>
            Interests
            {user?.userId == profile?.userId && (
              <Tooltip text="Add interest">
                <Button.Icon onClick={() => setDrawerOpen("add-interest")}>
                  <LuPlus />
                </Button.Icon>
              </Tooltip>
            )}
          </h1>
          {profile?.tags?.length > 0 ? (
            <>
              {profile.tags.map((tag) => {
                if (profile?.userId == user?.userId) {
                  return (
                    <SmallText.DestructiveBadge
                      key={tag.tagId}
                      text={tag.tagName}
                      onClick={() =>
                        handleRemoveTag(
                          tag.tagId,
                          profile,
                          setProfile,
                          setChanges,
                        )
                      }
                    />
                  );
                } else {
                  return <SmallText.Badge key={tag.tagId} text={tag.tagName} />;
                }
              })}
            </>
          ) : (
            <SmallText text={"You seem to have no interests, add some!"} />
          )}
        </div>
        <hr />
        {user?.userId == profile?.userId && (
          <div className="profile-content">
            <h1>
              Saved Posts ( <strong>{profile?.savedPosts?.length || 0}</strong>{" "}
              )
            </h1>
            <div className="posts-container">
              {profile?.savedPosts?.length > 0 ? (
                profile.savedPosts.map((post) => (
                  <PostCard
                    key={post.postId}
                    post={post}
                    setProfile={setProfile}
                    setChanges={setChanges}
                    postType="saved"
                    isOwner={user?.userId == profile?.userId}
                  />
                ))
              ) : (
                <SmallText text="No saved posts yet" />
              )}
            </div>
          </div>
        )}
        {profile?.role === "Client" && (
          <div className="profile-content">
            <h1>
              Posts ( <strong>{profile?.clientPosts?.length || 0}</strong> )
            </h1>
            <div className="posts-container">
              {profile?.clientPosts?.length > 0 ? (
                profile.clientPosts.map((post) => (
                  <PostCard
                    key={post.postId}
                    post={post}
                    setProfile={setProfile}
                    setChanges={setChanges}
                    postType="client"
                    isOwner={user?.userId == profile?.userId}
                  />
                ))
              ) : (
                <SmallText text="No posts yet" />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileCard;
