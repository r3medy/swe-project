import "@/pages/Pending/Pending.css";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import {
  Navigation,
  PaginationControls,
  SmallText,
  Status,
} from "@/components";
import { useSession } from "@/contexts/useSession";

import EditPostDrawer from "./components/EditPostDrawer";
import PendingPostsTable from "./components/PendingPostsTable";
import PostImageDrawer from "./components/PostImageDrawer";
import { usePendingPosts } from "./hooks/usePendingPosts";

function Pending() {
  const { user } = useSession();
  const navigate = useNavigate();
  const {
    isLoading,
    posts,
    page,
    canLoadNextPage,
    currentPost,
    editPost,
    openedDrawer,
    isDrawerButtonDisabled,
    closeDrawer,
    closeEditDrawer,
    handlePageChange,
    openEditDrawer,
    openImageDrawer,
    updateEditPost,
    handlePaymentAmountChange,
    handleEditSubmit,
    handleUpdateStatus,
  } = usePendingPosts();

  useEffect(() => {
    if (!user || user.role !== "Admin") navigate("/");
  }, [user, navigate]);

  return (
    <>
      <Navigation />
      <div className="pending-container">
        {isLoading ? (
          <Status
            text="Loading..."
            subtext="Please wait while we load the posts..."
          />
        ) : posts.length === 0 && page === 1 ? (
          <Status.Error
            text="No posts found"
            subtext="There are no pending posts to display."
          />
        ) : (
          <>
            <div className="posts-header">
              <h2>Pending posts</h2>
              <SmallText
                text={`Showing page ${page} of pending posts`}
              />
            </div>
            <PendingPostsTable
              posts={posts}
              currentUser={user}
              onUpdateStatus={handleUpdateStatus}
              onOpenEdit={openEditDrawer}
              onOpenImage={openImageDrawer}
            />
            <PaginationControls
              page={page}
              hasNextPage={canLoadNextPage}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              label="Pending posts"
            />
            <EditPostDrawer
              isOpen={openedDrawer === "edit"}
              currentPost={currentPost}
              editPost={editPost}
              isDisabled={isDrawerButtonDisabled}
              onClose={closeEditDrawer}
              onSubmit={handleEditSubmit}
              onChangeField={updateEditPost}
              onPaymentAmountChange={handlePaymentAmountChange}
            />
            <PostImageDrawer
              isOpen={openedDrawer === "view-image"}
              currentPost={currentPost}
              onClose={closeDrawer}
            />
          </>
        )}
      </div>
    </>
  );
}

export default Pending;
