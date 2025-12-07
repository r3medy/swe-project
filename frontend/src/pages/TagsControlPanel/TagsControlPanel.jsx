import "@/pages/TagsControlPanel/TagsControlPanel.css";
import {
  Status,
  Navigation,
  Table,
  SmallText,
  Tooltip,
  Button,
  Drawer,
  Input,
} from "@/components";
import { LuPlus, LuTrash, LuBrush } from "react-icons/lu";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

function TagsControlPanel() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [newTagName, setNewTagName] = useState();

  const fetchTags = useCallback(() => {
    setIsLoading(true);

    fetch("http://localhost:8000/tags")
      .then((res) => res.json())
      .then((data) => setTags(data))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDeleteTag = (tagId) => {
    toast.promise(
      fetch(`http://localhost:8000/tags/${tagId}`, {
        method: "DELETE",
        credentials: "include",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete tag");
        fetchTags();
        return res.json();
      }),
      {
        loading: "Deleting tag...",
        success: "Tag deleted successfully",
        error: "Failed to delete tag",
      }
    );
  };
  const handleAddTag = () => {
    if (!newTagName || newTagName.length === 0)
      return toast.error("Tag name is required");
    toast.promise(
      fetch("http://localhost:8000/tags", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagName: newTagName }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to add tag");
        fetchTags();
        setNewTagName("");
        return res.json();
      }),
      {
        loading: "Adding tag...",
        success: "Tag added successfully",
        error: "Failed to add tag",
      }
    );
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="tags-container">
      <Navigation />
      {isLoading && (
        <Status text="Loading" subtext="Please wait while we load the tags" />
      )}
      {!isLoading && tags.length === 0 && (
        <Status.Error text="No tags" subtext="No tags found" />
      )}
      {!isLoading && tags.length > 0 && (
        <>
          <div className="tags-header">
            <h2>Tags control panel</h2>
            <SmallText
              text={`Where you could manage your ${tags.length} tags`}
            />
            <div className="tags-header-input">
              <Input
                name="add-new-tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
              />
              <Button.Icon onClick={handleAddTag}>
                <LuPlus />
              </Button.Icon>
            </div>
          </div>
          <Table
            headers={["ID", "Name", "Actions"]}
            rows={tags.map((tag) => [
              <SmallText text={tag.tagId} />,
              <p>{tag.tagName}</p>,
              <Tooltip text="Delete">
                <Button.Icon onClick={() => handleDeleteTag(tag.tagId)}>
                  <LuTrash />
                </Button.Icon>
              </Tooltip>,
            ])}
          />
          <Drawer
            isOpen={!!selectedTag}
            title="Edit Tag"
            onClose={() => setSelectedTag(null)}
          >
            <p>edit tag</p>
          </Drawer>
        </>
      )}
    </div>
  );
}

export default TagsControlPanel;
