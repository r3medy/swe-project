import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import "./Drawer.css";

const Drawer = ({ isOpen, onClose, title, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return createPortal(
    <div
      className={`bottom-drawer-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className="bottom-drawer-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottom-drawer-header">
          <h2 className="bottom-drawer-title">{title}</h2>
          <button className="bottom-drawer-close" onClick={onClose}>
            <LuX size={24} />
          </button>
        </div>
        <div className="bottom-drawer-body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
