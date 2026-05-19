import { useState, useRef, useEffect, useCallback } from "react";

import Button from "@/components/Button/Button";
import "./Dropdown.css";

const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

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

  useEffect(() => {
    if (!isOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const items = Array.from(
      menu.querySelectorAll('.dropdown-item:not([disabled])')
    );
    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    const focusTimer = setTimeout(() => firstItem?.focus(), 0);

    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const currentIndex = items.indexOf(active);

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1]?.focus();
          } else {
            firstItem?.focus();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1]?.focus();
          } else {
            lastItem?.focus();
          }
          break;
        case "Home":
          e.preventDefault();
          firstItem?.focus();
          break;
        case "End":
          e.preventDefault();
          lastItem?.focus();
          break;
        case "Tab":
          if (e.shiftKey && active === firstItem) {
            e.preventDefault();
            setIsOpen(false);
            triggerRef.current?.focus();
          } else if (!e.shiftKey && active === lastItem) {
            setIsOpen(false);
          }
          break;
        default:
          break;
      }
    };

    menu.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      menu.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div
        ref={triggerRef}
        className="dropdown-trigger"
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>
      {isOpen ? (
        <div ref={menuRef} className="dropdown-menu" onClick={close} role="menu">
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
      role="menuitem"
      tabIndex={-1}
      {...props}
    >
      {children}
    </Button.Text>
  );
};

Dropdown.Item = Item;

export default Dropdown;
