import { useRef } from "react";
import { LuSearch } from "react-icons/lu";
import "@/components/SearchBar/SearchBar.css";

const SearchBar = ({ onSearch, value, onChange, ...props }) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value ?? e.target.value);
    }
  };

  const handleIconClick = () => {
    if (onSearch) {
      onSearch(value ?? inputRef.current?.value ?? "");
    }
  };

  const handleChange = (e) => {
    if (onChange) onChange(e);
  };

  return (
    <div className="searchbar">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a name, tag, or what you desire..."
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        value={value}
        {...props}
      />
      <LuSearch onClick={handleIconClick} />
    </div>
  );
};

export default SearchBar;
