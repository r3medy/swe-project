import { useRef } from "react";
import { LuSearch } from "react-icons/lu";
import "@/components/SearchBar/SearchBar.css";

const SearchBar = ({ onSearch, ...props }) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) onSearch(e.target.value);
  };

  const handleIconClick = () => {
    if (onSearch && inputRef.current) onSearch(inputRef.current.value);
  };

  return (
    <div className="searchbar">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a name, tag, or what you desire..."
        onKeyDown={handleKeyDown}
        {...props}
      />
      <LuSearch onClick={handleIconClick} />
    </div>
  );
};

export default SearchBar;
