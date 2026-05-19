import { Drawer, Input, Select, Button, SmallText } from "@/components";
import {
  handleAddTag,
  handleChangeTitle,
  handleChangeProfilePicture,
} from "../Extras/handlers";

const ProfileDrawers = ({
  drawerOpen,
  setDrawerOpen,
  profile,
  setProfile,
  setChanges,
  tags,
  selectRef,
  setIsLoading,
  changes,
  backupProfile,
}) => {
  const handleBioChange = (e) => {
    const newBio = e.target.value;
    setProfile((prev) => ({ ...prev, bio: newBio }));

    if (newBio !== backupProfile?.bio) {
      setChanges((prev) => {
        const filtered = prev.filter((c) => c.type !== "edit-bio");
        return [...filtered, { type: "edit-bio", bio: newBio }];
      });
    } else {
      setChanges((prev) => prev.filter((c) => c.type !== "edit-bio"));
    }
  };

  return (
    <>
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
            onChange={handleBioChange}
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
                    (profileTag) => profileTag?.tagId === tag?.tagId,
                  ),
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
                setDrawerOpen,
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
                  setIsLoading,
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

export default ProfileDrawers;
