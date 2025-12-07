import "@/components/SmallText/SmallText.css";
import { LuTrash, LuMoveRight } from "react-icons/lu";
import { useState } from "react";

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

const DestructiveBadge = ({ text, children, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="small-text destructive-badge"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {isHovered ? (
        <>
          <LuTrash size={14} /> {text}
        </>
      ) : (
        <>
          {text} {children}
        </>
      )}
    </span>
  );
};

SmallText.Badge = Badge;
SmallText.ClickableBadge = ClickableBadge;
SmallText.DestructiveBadge = DestructiveBadge;

export default SmallText;
