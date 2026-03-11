import "@/components/SmallText/SmallText.css";
import { LuTrash, LuMoveRight } from "react-icons/lu";

const SmallText = ({ text, children, ...props }) => {
  return (
    <span className="small-text" {...props}>
      {text} {children}
    </span>
  );
};

const Badge = ({ text, children, ...props }) => {
  return (
    <span className="small-text badge" {...props}>
      {text} {children}
    </span>
  );
};

const ClickableBadge = ({ text, children, isClicked, ...props }) => {
  return (
    <span className="small-text clickable-badge" {...props}>
      {isClicked ? (
        <>
          <LuMoveRight size={14} /> {text}
        </>
      ) : (
        <>
          {text} {children}
        </>
      )}
    </span>
  );
};

/**
 * DestructiveBadge - refactored to use CSS :hover instead of useState
 * (rerender-move-effect-to-event) Avoid state-driven re-renders for
 * visual-only hover effects; use CSS instead.
 */
const DestructiveBadge = ({ text, children, ...props }) => {
  return (
    <span className="small-text destructive-badge" {...props}>
      <span className="destructive-badge-hover-content">
        <LuTrash size={14} /> {text}
      </span>
      <span className="destructive-badge-default-content">
        {text} {children}
      </span>
    </span>
  );
};

SmallText.Badge = Badge;
SmallText.ClickableBadge = ClickableBadge;
SmallText.DestructiveBadge = DestructiveBadge;

export default SmallText;
