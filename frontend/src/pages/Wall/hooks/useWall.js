import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { toast } from "react-hot-toast";
import { get, post } from "@/utils/request";
import { buildPaginatedPath, hasNextPage } from "@/utils/pagination";

const WALL_PAGE_SIZE = 20;
const TAGS_FILTER_LIMIT = 50;

const DEFAULT_FILTERS = {
  sortBy: "None",
  clientName: "",
  tags: [],
};

export function useWall() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [canLoadNextPage, setCanLoadNextPage] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [proposalInfo, setProposalInfo] = useState({
    postId: null,
    description: "",
  });
  const [openDrawer, setOpenDrawer] = useState(null);

  const buildQueryParams = useCallback((search, filters) => {
    const params = new URLSearchParams();
    if (search) params.append("searchTerm", search);
    if (filters.clientName) params.append("clientName", filters.clientName);
    if (filters.tags.length > 0) params.append("tags", filters.tags.join(","));
    if (filters.sortBy !== "None") params.append("sortBy", filters.sortBy);
    return params.toString();
  }, []);

  const fetchPosts = useCallback(
    async (search = "", filters = DEFAULT_FILTERS, pageToFetch = 1) => {
      const queryString = buildQueryParams(search, filters);
      const path = `/wall${queryString ? `?${queryString}` : ""}`;
      return get(
        buildPaginatedPath(path, {
          page: pageToFetch,
          limit: WALL_PAGE_SIZE,
        }),
      );
    },
    [buildQueryParams],
  );

  const fetchTags = useCallback(async () => {
    return get(buildPaginatedPath("/tags", { page: 1, limit: TAGS_FILTER_LIMIT }));
  }, []);

  const loadPosts = useCallback(
    async ({
      pageToFetch = 1,
      search = searchTerm,
      filters = selectedFilters,
      errorMessage = "Failed to load posts",
    } = {}) => {
      try {
        setIsLoading(true);
        const postsData = await fetchPosts(search, filters, pageToFetch);
        setPosts(postsData);
        setPage(pageToFetch);
        setCanLoadNextPage(hasNextPage(postsData, WALL_PAGE_SIZE));
      } catch (e) {
        console.error(e);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPosts, searchTerm, selectedFilters],
  );

  const handleSearch = useCallback(async () => {
    await loadPosts({
      pageToFetch: 1,
      search: searchTerm,
      filters: selectedFilters,
      errorMessage: "Failed to search posts",
    });
  }, [loadPosts, searchTerm, selectedFilters]);

  const handlePageChange = useCallback(async (nextPage) => {
    if (nextPage < 1) return;
    await loadPosts({ pageToFetch: nextPage });
  }, [loadPosts]);

  const handleClear = useCallback(async () => {
    setSearchTerm("");
    setSelectedFilters(DEFAULT_FILTERS);
    await loadPosts({
      pageToFetch: 1,
      search: "",
      filters: DEFAULT_FILTERS,
      errorMessage: "Failed to clear filters",
    });
  }, [loadPosts]);

  const handleSubmitFilters = useCallback(async () => {
    setOpenDrawer(null);
    await handleSearch();
  }, [handleSearch]);

  const handleSavePost = useCallback(async (postId) => {
    try {
      const data = await post(`/posts/${postId}`);
      if (data?.status === 200) {
        toast.success(data.message);
      } else {
        throw new Error(data?.message || "Failed to save post");
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
        const data = await post(`/proposals/${proposalInfo.postId}`, {
          description: proposalInfo.description,
        });
        if (data?.success) {
          toast.success(data.message);
        } else {
          toast.error(data?.message || "Failed to submit proposal");
        }
      } catch (e) {
        toast.error(e.message || "Failed to submit proposal");
      }
    },
    [proposalInfo],
  );

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

  const hasActiveFilters = useMemo(
    () =>
      selectedFilters.sortBy !== "None" ||
      selectedFilters.clientName !== "" ||
      selectedFilters.tags.length > 0,
    [selectedFilters],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const queryFromUrl = searchParams.get("q") || "";
        setSearchTerm(queryFromUrl);

        const [tagsData, postsData] = await Promise.all([
          fetchTags(),
          fetchPosts(queryFromUrl, DEFAULT_FILTERS, 1),
        ]);

        setTags(tagsData);
        setPosts(postsData);
        setPage(1);
        setCanLoadNextPage(hasNextPage(postsData, WALL_PAGE_SIZE));
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
    page,
    canLoadNextPage,
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
    handlePageChange,
    handleSubmitFilters,
    handleSavePost,
    handleSubmitProposal,
    updateFilter,
    toggleTag,
  };
}
