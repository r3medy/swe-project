import { useState, useRef, useEffect, useCallback } from "react";

import Button from "@/components/Button/Button";
import "./Dropdown.css";

const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // (client-event-listeners) Stable callback ref with useCallback
  const handleClickOutside = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target))
      setIsOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // (rerender-functional-setstate) Use functional setState for toggle
  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={toggleOpen}>
        {trigger}
      </div>
      {/* (rendering-conditional-render) Use ternary, not && for conditionals */}
      {isOpen ? (
        <div className="dropdown-menu" onClick={close}>
          {children}
        </div>
      ) : null}
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
