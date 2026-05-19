import "@/pages/TagsControlPanel/TagsControlPanel.css";
import {
  Status,
  Navigation,
  Table,
  SmallText,
  Tooltip,
  Button,
  Input,
  PaginationControls,
} from "@/components";
import { get, post, del } from "@/utils/request";
import { buildPaginatedPath, hasNextPage } from "@/utils/pagination";
import { LuPlus, LuTrash } from "react-icons/lu";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const TAGS_PAGE_SIZE = 20;

function TagsControlPanel() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [page, setPage] = useState(1);

  const fetchTags = useCallback(async (pageToFetch = 1) => {
    try {
      setIsLoading(true);
      const data = await get(
        buildPaginatedPath("/tags", {
          page: pageToFetch,
          limit: TAGS_PAGE_SIZE,
        }),
      );
      setTags(data);
      setPage(pageToFetch);
    } catch {
      toast.error("Failed to load tags");
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePageChange = useCallback(
    (nextPage) => {
      if (nextPage < 1) return;
      fetchTags(nextPage);
    },
    [fetchTags],
  );

  const handleDeleteTag = (tagId) => {
    toast.promise(
      del(`/tags/${tagId}`).then((data) => {
        fetchTags(page);
        return data;
      }),
      {
        loading: "Deleting tag...",
        success: "Tag deleted successfully",
        error: "Failed to delete tag",
      },
    );
  };
  const handleAddTag = () => {
    if (!newTagName || newTagName.length === 0)
      return toast.error("Tag name is required");
    toast.promise(
      post("/tags", { tagName: newTagName }).then((data) => {
        fetchTags(1);
        setNewTagName("");
        return data;
      }),
      {
        loading: "Adding tag...",
        success: "Tag added successfully",
        error: "Failed to add tag",
      },
    );
  };

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <div className="tags-container">
      <Navigation />
      {isLoading && (
        <Status text="Loading" subtext="Please wait while we load the tags" />
      )}
      {!isLoading && tags.length === 0 && page === 1 && (
        <Status.Error text="No tags" subtext="No tags found" />
      )}
      {!isLoading && (tags.length > 0 || page > 1) && (
        <>
          <div className="tags-header">
            <h2>Tags control panel</h2>
            <SmallText text={`Showing page ${page} of your tags`} />
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
          <PaginationControls
            page={page}
            hasNextPage={hasNextPage(tags, TAGS_PAGE_SIZE)}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            label="Tags"
          />
        </>
      )}
    </div>
  );
}

export default TagsControlPanel;
