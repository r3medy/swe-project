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
  SmallText,
} from "@/components";
import { useSession } from "@/contexts/SessionContext";
import {
  LuFilter,
  LuEraser,
  LuBookmark,
  LuScroll,
  LuPlus,
} from "react-icons/lu";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useSearchParams } from "react-router";

import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

const SORT_OPTIONS = [
  { value: "None", label: "None" },
  { value: "Newest", label: "Newest" },
  { value: "Oldest", label: "Oldest" },
  { value: "Cheapest", label: "Cheapest first" },
  { value: "Expensive", label: "Expensive first" },
];

const DEFAULT_FILTERS = {
  sortBy: "None",
  clientName: "",
  tags: [],
};

function Wall() {
  const { user: me } = useSession();
  const [searchParams] = useSearchParams();
  const [openDrawer, setOpenDrawer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [proposalInfo, setProposalInfo] = useState({
    postId: null,
    description: "",
  });

  const buildQueryParams = (search, filters) => {
    const params = new URLSearchParams();
    if (search) params.append("searchTerm", search);
    if (filters.clientName) {
      params.append("clientName", filters.clientName);
    }
    if (filters.tags.length > 0) {
      params.append("tags", filters.tags.join(","));
    }
    if (filters.sortBy !== "None") {
      params.append("sortBy", filters.sortBy);
    }
    return params.toString();
  };

  const fetchPosts = async (search = "", filters = DEFAULT_FILTERS) => {
    const queryString = buildQueryParams(search, filters);
    const url = `http://localhost:8000/wall${
      queryString ? `?${queryString}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  };

  const fetchTags = async () => {
    const res = await fetch("http://localhost:8000/tags");
    return await res.json();
  };

  const handleSearch = async () => {
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
  };

  const handleSubmitFilters = async () => {
    setOpenDrawer(null);
    await handleSearch();
  };

  const handleClear = async () => {
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
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setOpenDrawer(null);

    const res = await fetch(
      "http://localhost:8000/proposals/" + proposalInfo.postId,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: proposalInfo.description }),
      }
    );

    const data = await res.json();
    if (data.success) toast.success(data.message);
    else toast.error(data.message);
  };

  const handleSavePost = async (postId) => {
    try {
      const res = await fetch("http://localhost:8000/posts/" + postId, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (data.status === 200) toast.success(data.message);
      else throw new Error(data.message);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateFilter = (key, value) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tagId) => {
    setSelectedFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

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
  }, [searchParams]);

  const hasActiveFilters =
    selectedFilters.sortBy !== "None" ||
    selectedFilters.clientName ||
    selectedFilters.tags.length > 0;

  return (
    <>
      <Navigation />
      <div className="wall-container">
        <div className="wall-search">
          <SearchBar
            value={searchTerm}
            disabled={isLoading}
            onSearch={handleSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Tooltip text="Filters">
            <Button.Icon
              onClick={() => setOpenDrawer("filters")}
              disabled={tags.length === 0}
            >
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

        {isLoading && (
          <Status
            text="Loading..."
            subtext="Please wait while we load your posts"
          />
        )}

        {!isLoading && posts.length > 0 && (
          <div className="wall-content">
            {posts.map((post, idx) => {
              return (
                <div className="wall-post" key={idx}>
                  <div className="wall-post-header">
                    <div className="header-info">
                      <div className="header-info-user-details">
                        <img
                          src={
                            post.profilePicture
                              ? `http://localhost:8000${post.profilePicture}`
                              : post.gender == "Male"
                              ? profileImage1
                              : profileImage3
                          }
                          alt="Profile picture"
                        />
                        <div>
                          <h3>{`${post.firstName} ${post.lastName}`}</h3>
                          <SmallText
                            text={new Date(post.createdAt).toLocaleString()}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="header-info">
                      <div className="header-info-column">
                        <h4>
                          {!!post.hourlyRate
                            ? `$${post.hourlyRate}/hr`
                            : `$${post.budget}`}
                        </h4>
                        <SmallText
                          text={post.budget ? "Budget" : "Hourly Rate"}
                        />
                      </div>
                      <div className="header-info-column">
                        <h4>{post.proposalCount}</h4>
                        <SmallText text="Proposals" />
                      </div>
                    </div>
                  </div>
                  <div className="wall-post-body">
                    <h3>{post.jobTitle}</h3>
                    <p>{post.jobDescription}</p>
                    {post.jobThumbnail && (
                      <img
                        src={`http://localhost:8000${post.jobThumbnail}`}
                        alt="Job thumbnail"
                      />
                    )}
                    {post.tags.length > 0 && (
                      <div className="wall-post-tags">
                        {post.tags.map((tag) => (
                          <SmallText.Badge key={tag.tagId} text={tag.tagName} />
                        ))}
                      </div>
                    )}
                  </div>
                  <hr />
                  <div className="wall-post-actions">
                    {me?.userId ? (
                      <>
                        <Button.Icon
                          onClick={() => handleSavePost(post.postId)}
                        >
                          <LuBookmark />
                          Save Post
                        </Button.Icon>
                        {me?.role !== "Client" && (
                          <Button.Icon
                            onClick={() => {
                              setOpenDrawer("proposal");
                              setProposalInfo((prev) => ({
                                ...prev,
                                postId: post.postId,
                              }));
                            }}
                          >
                            <LuScroll />
                            Submit Proposal
                          </Button.Icon>
                        )}
                      </>
                    ) : (
                      <SmallText text="To perform any action, please ">
                        <Link to="/login">Login</Link>
                      </SmallText>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <Status.Error
            text="No posts found"
            subtext="Try adjusting your filters"
          />
        )}
      </div>
      <SideDrawer
        isOpen={openDrawer === "filters"}
        title="Filters"
        onClose={() => setOpenDrawer(null)}
      >
        <div className="filter-container">
          <div className="filter-section">
            <h3>Sorting</h3>
            <SmallText text="Sort posts by" />
            <div className="filter-order-column">
              {SORT_OPTIONS.map((option) => (
                <Input
                  key={option.value}
                  name="sortBy"
                  type="radio"
                  label={option.label}
                  checked={selectedFilters.sortBy === option.value}
                  onChange={() => updateFilter("sortBy", option.value)}
                />
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Client Name</h3>
            <SmallText text="Search posts by a client" />
            <Input
              name="client-name"
              type="text"
              placeholder="Patrick Jane"
              value={selectedFilters.clientName}
              onChange={(e) => updateFilter("clientName", e.target.value)}
            />
          </div>

          <div className="filter-section">
            <h3>Tags</h3>
            <SmallText text="Search posts by tags" />
            <div className="filter-section-tags">
              {tags.map((tag) => (
                <SmallText.ClickableBadge
                  key={tag.tagId}
                  text={tag.tagName}
                  isClicked={selectedFilters.tags.includes(tag.tagId)}
                  onClick={() => toggleTag(tag.tagId)}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleSubmitFilters} disabled={!hasActiveFilters}>
            Apply filters
          </Button>
        </div>
      </SideDrawer>
      <Drawer
        title="Proposal Submission"
        isOpen={openDrawer === "proposal"}
        onClose={() => setOpenDrawer(null)}
      >
        <form>
          <Input
            name="proposal-description"
            type="text"
            placeholder="Proposal description"
            value={proposalInfo.description}
            onChange={(e) =>
              setProposalInfo({ ...proposalInfo, description: e.target.value })
            }
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
