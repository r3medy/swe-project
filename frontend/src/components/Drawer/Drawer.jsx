import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import { useDrawerVisibility } from "./useDrawerVisibility";
import "./Drawer.css";

/**
 * Bottom sheet drawer component.
 * Uses shared useDrawerVisibility hook to eliminate duplicated logic
 * with SideDrawer (state-decouple-implementation).
 */
const Drawer = ({ isOpen, onClose, title, children }) => {
  const isVisible = useDrawerVisibility(isOpen);

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
    document.body,
  );
};

export default Drawer;
