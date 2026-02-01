import React from "react";
import { SmallText, Input, Button } from "@/components";

const SORT_OPTIONS = [
  { value: "None", label: "None" },
  { value: "Newest", label: "Newest" },
  { value: "Oldest", label: "Oldest" },
  { value: "Cheapest", label: "Cheapest first" },
  { value: "Expensive", label: "Expensive first" },
];

/**
 * FilterContent - Extracted filter drawer content
 * Follows patterns-children-over-render-props pattern
 */
const FilterContent = React.memo(function FilterContent({
  selectedFilters,
  tags,
  onUpdateFilter,
  onToggleTag,
  onSubmitFilters,
  hasActiveFilters,
}) {
  return (
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
              onChange={() => onUpdateFilter("sortBy", option.value)}
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
          onChange={(e) => onUpdateFilter("clientName", e.target.value)}
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
              onClick={() => onToggleTag(tag.tagId)}
            />
          ))}
        </div>
      </div>

      <Button onClick={onSubmitFilters} disabled={!hasActiveFilters}>
        Apply filters
      </Button>
    </div>
  );
});

export default FilterContent;
