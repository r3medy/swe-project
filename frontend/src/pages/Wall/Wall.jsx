import { useCallback } from "react";
import { Link } from "react-router";
import { LuFilter, LuEraser, LuPlus } from "react-icons/lu";

import "@/pages/Wall/Wall.css";
import {
  Navigation,
  SearchBar,
  Button,
  Tooltip,
  Drawer,
  SideDrawer,
  Status,
  Input,
} from "@/components";
import { useSession } from "@/contexts/SessionContext";
import { useWall } from "./hooks/useWall";
import WallPostCard from "./components/WallPostCard";
import FilterContent from "./components/FilterContent";

/**
 * Wall page - refactored following composition patterns
 * - Extracted state management to useWall hook (state-decouple-implementation)
 * - Extracted components for memoization (rerender-memo)
 * - Using useCallback for stable event handlers
 */
function Wall() {
  const { user: me } = useSession();

  const {
    isLoading,
    tags,
    posts,
    selectedFilters,
    searchTerm,
    setSearchTerm,
    proposalInfo,
    setProposalInfo,
    openDrawer,
    setOpenDrawer,
    hasActiveFilters,
    handleSearch,
    handleClear,
    handleSubmitFilters,
    handleSavePost,
    handleSubmitProposal,
    updateFilter,
    toggleTag,
  } = useWall();

  // Stable callbacks using useCallback
  const openFilters = useCallback(
    () => setOpenDrawer("filters"),
    [setOpenDrawer],
  );

  const closeDrawer = useCallback(() => setOpenDrawer(null), [setOpenDrawer]);

  const openProposal = useCallback(
    (postId) => {
      setOpenDrawer("proposal");
      setProposalInfo((prev) => ({ ...prev, postId }));
    },
    [setOpenDrawer, setProposalInfo],
  );

  const handleSearchTermChange = useCallback(
    (e) => setSearchTerm(e.target.value),
    [setSearchTerm],
  );

  const handleProposalDescriptionChange = useCallback(
    (e) =>
      setProposalInfo((prev) => ({ ...prev, description: e.target.value })),
    [setProposalInfo],
  );

  return (
    <>
      <Navigation />
      <div className="wall-container">
        <div className="wall-search">
          <SearchBar
            value={searchTerm}
            disabled={isLoading}
            onSearch={handleSearch}
            onChange={handleSearchTermChange}
          />
          <Tooltip text="Filters">
            <Button.Icon onClick={openFilters} disabled={tags.length === 0}>
              <LuFilter />
            </Button.Icon>
          </Tooltip>
          <Tooltip text="Clear search & filters">
            <Button.Icon onClick={handleClear}>
              <LuEraser />
            </Button.Icon>
          </Tooltip>
          {me?.role === "Client" && (
            <Tooltip text="Create a new post">
              <Button.Icon>
                <LuPlus />
                <Link to="/newpost">New</Link>
              </Button.Icon>
            </Tooltip>
          )}
        </div>

        {/* Explicit conditional rendering (rendering-conditional-render) */}
        {isLoading ? (
          <Status
            text="Loading..."
            subtext="Please wait while we load your posts"
          />
        ) : posts.length > 0 ? (
          <div className="wall-content">
            {posts.map((post) => (
              <WallPostCard
                key={post.postId}
                post={post}
                user={me}
                onSavePost={handleSavePost}
                onOpenProposal={openProposal}
              />
            ))}
          </div>
        ) : (
          <Status.Error
            text="No posts found"
            subtext="Try adjusting your filters"
          />
        )}
      </div>

      <SideDrawer
        isOpen={openDrawer === "filters"}
        title="Filters"
        onClose={closeDrawer}
      >
        <FilterContent
          selectedFilters={selectedFilters}
          tags={tags}
          onUpdateFilter={updateFilter}
          onToggleTag={toggleTag}
          onSubmitFilters={handleSubmitFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </SideDrawer>

      <Drawer
        title="Proposal Submission"
        isOpen={openDrawer === "proposal"}
        onClose={closeDrawer}
      >
        <form>
          <Input.TextArea
            name="proposal-description"
            placeholder="Proposal description"
            value={proposalInfo.description}
            onChange={handleProposalDescriptionChange}
            style={{ marginBottom: "1rem" }}
          />
          <Button
            onClick={handleSubmitProposal}
            disabled={!proposalInfo.description}
          >
            Submit proposal
          </Button>
        </form>
      </Drawer>
    </>
  );
}

export default Wall;
