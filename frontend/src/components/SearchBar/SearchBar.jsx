import { LuSearch } from "react-icons/lu";
import "@/components/SearchBar/SearchBar.css";

function SearchBar() {
  return (
    <div className="searchbar">
      <input
        type="text"
        placeholder="Enter a name, tag, or what you desire..."
      />
      <LuSearch />
    </div>
  );
}

export default SearchBar;
