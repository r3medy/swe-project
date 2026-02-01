import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "@/config";

const DEFAULT_FILTERS = {
  sortBy: "None",
  clientName: "",
  tags: [],
};

/**
 * Custom hook for Wall page state management
 * Follows state-decouple-implementation pattern
 */
export function useWall() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [proposalInfo, setProposalInfo] = useState({
    postId: null,
    description: "",
  });
  const [openDrawer, setOpenDrawer] = useState(null);

  // Build query params - extracted into a pure function
  const buildQueryParams = useCallback((search, filters) => {
    const params = new URLSearchParams();
    if (search) params.append("searchTerm", search);
    if (filters.clientName) params.append("clientName", filters.clientName);
    if (filters.tags.length > 0) params.append("tags", filters.tags.join(","));
    if (filters.sortBy !== "None") params.append("sortBy", filters.sortBy);
    return params.toString();
  }, []);

  const fetchPosts = useCallback(
    async (search = "", filters = DEFAULT_FILTERS) => {
      const queryString = buildQueryParams(search, filters);
      const url = `${API_BASE_URL}/wall${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url, { method: "GET", credentials: "include" });
      return res.json();
    },
    [buildQueryParams],
  );

  const fetchTags = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/tags`);
    return res.json();
  }, []);

  const handleSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      const postsData = await fetchPosts(searchTerm, selectedFilters);
      setPosts(postsData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to search posts");
    } finally {
      setIsLoading(false);
    }
  }, [fetchPosts, searchTerm, selectedFilters]);

  const handleClear = useCallback(async () => {
    setSearchTerm("");
    setSelectedFilters(DEFAULT_FILTERS);
    try {
      setIsLoading(true);
      const postsData = await fetchPosts("", DEFAULT_FILTERS);
      setPosts(postsData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to clear filters");
    } finally {
      setIsLoading(false);
    }
  }, [fetchPosts]);

  const handleSubmitFilters = useCallback(async () => {
    setOpenDrawer(null);
    await handleSearch();
  }, [handleSearch]);

  const handleSavePost = useCallback(async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === 200) {
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const handleSubmitProposal = useCallback(
    async (e) => {
      e.preventDefault();
      setOpenDrawer(null);

      try {
        const res = await fetch(
          `${API_BASE_URL}/proposals/${proposalInfo.postId}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: proposalInfo.description }),
          },
        );
        const data = await res.json();
        if (data.success) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } catch {
        toast.error("Failed to submit proposal");
      }
    },
    [proposalInfo],
  );

  // Functional setState for filter updates (rerender-functional-setstate)
  const updateFilter = useCallback((key, value) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleTag = useCallback((tagId) => {
    setSelectedFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  }, []);

  // Derived state (rerender-derived-state)
  const hasActiveFilters = useMemo(
    () =>
      selectedFilters.sortBy !== "None" ||
      selectedFilters.clientName !== "" ||
      selectedFilters.tags.length > 0,
    [selectedFilters],
  );

  // Initial load effect - using Promise.all for parallel fetching (async-parallel)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const queryFromUrl = searchParams.get("q") || "";
        if (queryFromUrl) {
          setSearchTerm(queryFromUrl);
        }

        const [tagsData, postsData] = await Promise.all([
          fetchTags(),
          fetchPosts(queryFromUrl, DEFAULT_FILTERS),
        ]);

        setTags(tagsData);
        setPosts(postsData);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [searchParams, fetchTags, fetchPosts]);

  return {
    // State
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

    // Actions
    handleSearch,
    handleClear,
    handleSubmitFilters,
    handleSavePost,
    handleSubmitProposal,
    updateFilter,
    toggleTag,
  };
}
