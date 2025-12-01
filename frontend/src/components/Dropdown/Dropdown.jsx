import { useState, useRef, useEffect } from "react";

import Button from "@/components/Button/Button";
import "./Dropdown.css";

const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="dropdown-menu" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
};

const Item = ({ children, onClick, destructive, ...props }) => {
  return (
    <Button.Text
      className={`dropdown-item ${destructive ? "destructive" : ""}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button.Text>
  );
};

Dropdown.Item = Item;

export default Dropdown;
