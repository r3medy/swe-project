import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import {
  LuUser,
  LuCalendar1,
  LuPlus,
  LuShare2,
  LuPenLine,
  LuCircleX,
  LuLoaderCircle,
  LuBadgeCheck,
} from "react-icons/lu";
import ReactCountryFlag from "react-country-flag";
import toast from "react-hot-toast";

import "./Profile.css";
import profileImage1 from "@/assets/profilepictures/1.png";

import useSession from "@/hooks/useSession";
import SmallText from "@/components/SmallText/SmallText";
import Navigation from "@/components/Navigation/Navigation";
import Button from "@/components/Button/Button";
import Tooltip from "@/components/Tooltip/Tooltip";
import Drawer from "@/components/Drawer/Drawer";
import Input from "@/components/Input/Input";
import Select from "@/components/Select/Select";

const ChangesPopup = ({
  changes,
  backupProfile,
  setProfile,
  setChanges,
  isLoading,
  setIsLoading,
}) => {
  const handleApplyChanges = () => {
    setIsLoading(true);
    fetch("http://localhost:8000/profile", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Profile updated successfully");
          setChanges([]);
          setIsLoading(false);
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong");
        setIsLoading(false);
      });
  };
  const handleCancelChanges = () => {
    setProfile(backupProfile);
    setChanges([]);
  };

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
          onClick={handleApplyChanges}
          className="changes-popup-right"
          disabled={isLoading}
        >
          Apply
        </Button>
        <Button.Text onClick={handleCancelChanges} disabled={isLoading}>
          Cancel
        </Button.Text>
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
  const handleShareProfile = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(
      `${window.location.origin}/profile/@${profile.username}`
    );
    toast.success("Profile link copied to clipboard");
  };

  const handleRemoveTag = (tagId) => {
    const newTags = profile.tags.filter((tag) => tag.tagId !== tagId);
    setChanges((prev) => [...prev, { type: "remove-tag", tagId }]);
    setProfile({ ...profile, tags: newTags });
  };

  return (
    <>
      <div className="profile-header">
        <div className="header-info">
          <div className="header-details">
            <img src={profileImage1} alt="Profile Image" loading="lazy" />
            <div className="header-text">
              <h1>
                <ReactCountryFlag
                  countryCode={profile.country}
                  className="country-flag"
                />
                {`${profile.firstName} ${profile.lastName}`}
              </h1>
              <p>{profile.title}</p>
              <SmallText text={`@${profile.username}`} />
            </div>
          </div>
          <div className="header-actions">
            <Tooltip text="Share your profile">
              <Button.Icon onClick={handleShareProfile}>
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
            {user?.userId === profile?.userId && (
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
            {user?.userId === profile?.userId && (
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
                if (profile?.userId === user?.userId) {
                  return (
                    <SmallText.DestructiveBadge
                      key={tag.tagId}
                      text={tag.tagName}
                      onClick={() => handleRemoveTag(tag.tagId)}
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
      </div>
      {/* <div className="profile-posts"></div> */}
      {/* <div className="profile-savedposts"></div> */}
    </>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const [tags, setTags] = useState();
  const [drawerOpen, setDrawerOpen] = useState(null);
  const [changes, setChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [backupProfile, setBackupProfile] = useState(null);
  const selectRef = useRef(null);
  const { profileQuery } = useParams();

  const fetchProfile = useCallback(async (profileQuery) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/profile/${profileQuery ?? ""}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setProfile(data?.user);
      setBackupProfile(data?.user);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
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
    } catch (err) {
      console.log(err);
    }
  }, [profile]);

  const handleAddTag = () => {
    const selectedTag = tags.find(
      (tag) => tag.tagName === selectRef.current.value
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

  useEffect(() => {
    fetchProfile(profileQuery);
    fetchTags();
  }, [profileQuery]);

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
          <div className="centered-container">
            <LuLoaderCircle size={48} className="spin" />
            <h1>Loading profile...</h1>
            <SmallText text="Please wait while we load your requested profile" />
          </div>
        )}
        {!isLoading && !profile && (
          <div className="centered-container">
            <LuCircleX size={48} color="#ef4444" />
            <h1>Profile not found</h1>
            <SmallText text="The profile you are looking for does not exist or has been deleted" />
            <Button onClick={() => navigate("/")}>Back to home</Button>
          </div>
        )}
        {isLoading && changes.length > 0 && (
          <div className="centered-container">
            <LuLoaderCircle size={48} className="spin" />
            <h1>Saving your changes...</h1>
            <SmallText text="Please wait while we save your changes" />
          </div>
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
          />
          <Button onClick={handleAddTag}>Add Interest</Button>
        </Drawer>
      )}
    </>
  );
};

export default Profile;
