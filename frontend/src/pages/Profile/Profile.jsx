import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";

import "./Profile.css";

import { useSession } from "@/contexts/SessionContext";
import { Navigation, Button, Status } from "@/components";
import {
  fetchProfile,
  fetchTags,
  fetchSavedPosts,
  fetchPosts,
} from "./Extras/fetchers";

import ChangesPopup from "./components/ChangesPopup";
import ProfileCard from "./components/ProfileCard";
import ProfileDrawers from "./components/ProfileDrawers";

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
          setIsLoading(false);
          return;
        }

        if (fetchedProfile?.role === "Client")
          await fetchPosts(profileQuery, setProfile, setBackupProfile);
        if (user && fetchedProfile?.userId == user?.userId)
          await fetchSavedPosts(setProfile, setBackupProfile);
      } catch (e) {
        toast.error("An error occured while loading profile");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [profileQuery, user]);

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
      <ProfileDrawers
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        profile={profile}
        setProfile={setProfile}
        setChanges={setChanges}
        tags={tags}
        selectRef={selectRef}
        setIsLoading={setIsLoading}
        changes={changes}
        backupProfile={backupProfile}
      />
    </>
  );
};

export default Profile;
