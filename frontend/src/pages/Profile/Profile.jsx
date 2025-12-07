import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  LuUser,
  LuCalendar1,
  LuPlus,
  LuShare2,
  LuPenLine,
  LuCircleX,
  LuBookDashed,
  LuBadgeCheck,
  LuBadgeDollarSign,
  LuTimer,
  LuCamera,
} from "react-icons/lu";
import ReactCountryFlag from "react-country-flag";

import "./Profile.css";
import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

import { useSession } from "@/contexts/SessionContext";
import {
  SmallText,
  Navigation,
  Button,
  Tooltip,
  Drawer,
  Input,
  Select,
  Status,
} from "@/components";
import {
  handleApplyChanges,
  handleCancelChanges,
  handleShareProfile,
  handleRemoveTag,
  handleAddTag,
  handleChangeTitle,
  handleRemoveSavedPost,
  handleChangeProfilePicture,
} from "./Extras/handlers";
import {
  fetchProfile,
  fetchTags,
  fetchSavedPosts,
  fetchPosts,
} from "./Extras/fetchers";

const ChangesPopup = ({
  changes,
  backupProfile,
  setProfile,
  setChanges,
  isLoading,
  setIsLoading,
}) => {
  return (
    <div className="changes-popup">
      <div className="changes-popup-left">
        <LuBadgeCheck size={24} />
        <p>
          Click apply to save your <strong>{changes.length}</strong> changes!
        </p>
      </div>
      <div className="changes-popup-right">
        <Button
          onClick={() => handleApplyChanges(changes, setIsLoading, setChanges)}
          className="changes-popup-right"
          disabled={isLoading}
        >
          Apply
        </Button>
        <Button.Text
          onClick={() =>
            handleCancelChanges(setProfile, backupProfile, setChanges)
          }
          disabled={isLoading}
        >
          Cancel
        </Button.Text>
      </div>
    </div>
  );
};

const PostCard = ({ post, setProfile, setChanges, postType }) => {
  return (
    <div className="post-card">
      <h3>
        {post.title}
        {postType === "saved" && (
          <Tooltip text="Remove post">
            <Button.Icon
              onClick={(e) =>
                handleRemoveSavedPost(post.postId, setProfile, setChanges)
              }
            >
              <LuCircleX />
            </Button.Icon>
          </Tooltip>
        )}
      </h3>
      <SmallText text={post.description} />
      <div className="post-footer">
        <Tooltip text="Budget">
          <div className="post-metric">
            <LuBadgeDollarSign />
            <span>${post.budget}</span>
          </div>
        </Tooltip>
        <Tooltip text="Status">
          <div className="post-metric">
            <LuBookDashed />
            <span>{post.status}</span>
          </div>
        </Tooltip>
        <Tooltip text="Hourly Rate">
          <div className="post-metric">
            <LuTimer />
            <span>${post.hourlyRate}/hr</span>
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
                          setChanges
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

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const selectRef = useRef(null);
  const { profileQuery } = useParams();

  const [tags, setTags] = useState();
  const [drawerOpen, setDrawerOpen] = useState(null);
  const [changes, setChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [backupProfile, setBackupProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const [fetchedProfile] = await Promise.all([
          fetchProfile(profileQuery, setProfile, setBackupProfile),
          fetchTags(setTags),
        ]);

        if (!fetchedProfile) {
          // Profile not found, just stop loading - Status.Error will show
          setIsLoading(false);
          return;
        }

        if (fetchedProfile?.role === "Client") {
          await fetchPosts(profileQuery, setProfile, setBackupProfile);
        }

        // Check if viewing own profile using string comparison
        if (user && String(fetchedProfile?.userId) === String(user?.userId)) {
          await fetchSavedPosts(setProfile, setBackupProfile);
        }
      } catch (e) {
        console.error("Error loading profile:", e);
        // Don't redirect - just show error state
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [profileQuery, user]);

  useEffect(() => {
    if (profile?.bio !== backupProfile?.bio) {
      const filteredChanges = changes.filter(
        (change) => change.type !== "edit-bio"
      );
      setChanges([
        ...filteredChanges,
        { type: "edit-bio", bio: profile.bio ?? "" },
      ]);
    }
  }, [profile?.bio]);

  return (
    <>
      <Navigation />
      <div className="profile-container">
        {isLoading && changes.length === 0 && (
          <Status
            text="Loading profile..."
            subtext="Please wait while we load your requested profile"
          />
        )}
        {!isLoading && !profile && (
          <Status.Error
            text="Profile not found"
            subtext="The profile you are looking for does not exist or has been deleted"
          >
            <Button onClick={() => navigate("/")}>Back to home</Button>
          </Status.Error>
        )}
        {isLoading && changes.length > 0 && (
          <Status
            text="Saving your changes..."
            subtext="Please wait while we save your changes"
          />
        )}
        {!isLoading && profile && (
          <ProfileCard
            profile={profile}
            setChanges={setChanges}
            setProfile={setProfile}
            user={user}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        )}
      </div>
      {changes.length > 0 && (
        <ChangesPopup
          changes={changes}
          backupProfile={backupProfile}
          setProfile={setProfile}
          setChanges={setChanges}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      {drawerOpen === "edit-bio" && (
        <Drawer
          title="Edit Bio"
          onClose={() => setDrawerOpen(null)}
          isOpen={drawerOpen}
        >
          <Input
            name="newbio"
            label="Your new bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            style={{ marginBottom: "1rem" }}
          />
          <Button onClick={() => setDrawerOpen(null)}>Change About Me</Button>
        </Drawer>
      )}
      {drawerOpen === "add-interest" && (
        <Drawer
          title="Add Interest"
          onClose={() => setDrawerOpen(null)}
          isOpen={drawerOpen}
        >
          <Select
            name="newinterest"
            label="Your new interest"
            options={tags
              ?.filter(
                (tag) =>
                  !profile?.tags?.some(
                    (profileTag) => profileTag?.tagId === tag?.tagId
                  )
              )
              ?.map((tag) => tag.tagName)}
            ref={selectRef}
            style={{ marginBottom: "1rem" }}
          />
          <Button
            onClick={() =>
              handleAddTag(
                tags,
                selectRef,
                profile,
                setProfile,
                setChanges,
                setDrawerOpen
              )
            }
          >
            Add Interest
          </Button>
        </Drawer>
      )}
      {drawerOpen === "change-title" && (
        <Drawer
          title="Change Title"
          onClose={() => setDrawerOpen(null)}
          isOpen={drawerOpen}
        >
          <Input
            name="newtitle"
            label="Your new title"
            value={profile.title}
            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            style={{ marginBottom: "1rem" }}
          />
          <Button
            onClick={() =>
              handleChangeTitle(profile, setProfile, setChanges, setDrawerOpen)
            }
          >
            Change Title
          </Button>
        </Drawer>
      )}
      {drawerOpen === "change-profile-picture" && (
        <Drawer
          title="Change Profile Picture"
          onClose={() => setDrawerOpen(null)}
          isOpen={drawerOpen}
        >
          <SmallText text="Upload a new profile picture, It will be saved on upload." />
          <Input
            type="file"
            name="newprofilepicture"
            accept="image/jpeg,image/png"
            onChange={(e) => {
              if (e.target.files[0]) {
                handleChangeProfilePicture(
                  e.target.files[0],
                  setProfile,
                  setIsLoading
                );
              }
            }}
            style={{ marginBottom: "1rem" }}
          />
        </Drawer>
      )}
    </>
  );
};

export default Profile;
