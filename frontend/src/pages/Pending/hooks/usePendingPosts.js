import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { get, put } from "@/utils/request";
import { buildPaginatedPath, hasNextPage } from "@/utils/pagination";

const PENDING_POSTS_PAGE_SIZE = 20;

export function usePendingPosts() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [currentPostId, setCurrentPostId] = useState();
  const [editPost, setEditPost] = useState({});
  const [openedDrawer, setOpenedDrawer] = useState(null);
  const [isDrawerButtonDisabled, setIsDrawerButtonDisabled] = useState(false);

  const fetchPosts = useCallback(async (pageToFetch = 1) => {
    try {
      setIsLoading(true);
      const data = await get(
        buildPaginatedPath("/admin/posts", {
          page: pageToFetch,
          limit: PENDING_POSTS_PAGE_SIZE,
        }),
      );
      setPosts(data);
      setPage(pageToFetch);
    } catch {
      toast.error("Error fetching posts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handlePageChange = useCallback(
    (nextPage) => {
      if (nextPage < 1) return;
      fetchPosts(nextPage);
    },
    [fetchPosts],
  );

  const currentPost = useMemo(
    () => posts.find((post) => post.postId === currentPostId),
    [posts, currentPostId],
  );

  const closeDrawer = useCallback(() => {
    setOpenedDrawer(null);
  }, []);

  const closeEditDrawer = useCallback(() => {
    setOpenedDrawer(null);
    setEditPost({});
  }, []);

  const openEditDrawer = useCallback((postId) => {
    setCurrentPostId(postId);
    setOpenedDrawer("edit");
  }, []);

  const openImageDrawer = useCallback((postId) => {
    setCurrentPostId(postId);
    setOpenedDrawer("view-image");
  }, []);

  const updateEditPost = useCallback((key, value) => {
    setEditPost((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePaymentAmountChange = useCallback((value) => {
    setEditPost((prev) =>
      (prev.jobType ?? currentPost?.jobType) === "Hourly"
        ? { ...prev, hourlyRate: value, budget: null }
        : { ...prev, budget: value, hourlyRate: null },
    );
  }, [currentPost?.jobType]);

  const handleEditSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDrawerButtonDisabled(true);

      try {
        const data = await put(`/posts/${currentPostId}`, editPost);
        if (data.status === 200) {
          toast.success("Post updated successfully");
          setOpenedDrawer(null);
          fetchPosts(page);
        } else {
          toast.error("Failed to update post");
        }
      } catch (error) {
        toast.error(error.message || "Error updating post");
      } finally {
        setIsDrawerButtonDisabled(false);
      }
    },
    [currentPostId, editPost, fetchPosts, page],
  );

  const handleUpdateStatus = useCallback(async (postId, status) => {
    try {
      const data = await put(`/admin/posts/${postId}`, { status });
      if (data.status === 200) {
        toast.success(`Post ${status.toLowerCase()} successfully`);
        setPosts((prev) => prev.filter((post) => post.postId !== postId));
      } else {
        toast.error(data.message || "Failed to update post status");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  }, []);

  return {
    isLoading,
    posts,
    page,
    canLoadNextPage: hasNextPage(posts, PENDING_POSTS_PAGE_SIZE),
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
  };
}
