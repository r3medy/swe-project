import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import Button from "@/components/Button/Button";
import { normalizePage } from "@/utils/pagination";
import "./PaginationControls.css";

function PaginationControls({
  page,
  hasNextPage,
  isLoading,
  onPageChange,
  label = "Results",
}) {
  const currentPage = normalizePage(page);

  return (
    <nav className="pagination-controls" aria-label={`${label} pagination`}>
      <Button.Text
        type="button"
        disabled={isLoading || currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <LuChevronLeft size={16} />
        Previous
      </Button.Text>
      <span>Page {currentPage}</span>
      <Button.Text
        type="button"
        disabled={isLoading || !hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <LuChevronRight size={16} />
      </Button.Text>
    </nav>
  );
}

export default PaginationControls;
