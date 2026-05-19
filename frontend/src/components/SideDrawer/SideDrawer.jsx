import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import { useDrawerVisibility } from "@/components/Drawer/useDrawerVisibility";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import "@/components/SideDrawer/SideDrawer.css";

/**
 * Side drawer component (slides in from right).
 * Uses shared useDrawerVisibility hook to eliminate duplicated logic
 * with bottom Drawer (state-decouple-implementation).
 * Includes focus trap and Escape key handling for accessibility.
 */
const SideDrawer = ({ isOpen, onClose, title, children }) => {
  const isVisible = useDrawerVisibility(isOpen);
  const contentRef = useFocusTrap(isOpen, onClose);

  if (!isVisible && !isOpen) return null;

  return createPortal(
    <div className={`drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div
        ref={contentRef}
        className="drawer-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="drawer-header">
          <h2 className="drawer-title">{title}</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <LuX size={24} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default SideDrawer;
