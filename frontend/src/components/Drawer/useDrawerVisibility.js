import { useEffect, useState } from "react";

/**
 * Shared hook for drawer open/close visibility logic.
 * Manages the delayed unmount to allow CSS exit animations to complete.
 *
 * @param {boolean} isOpen - Whether the drawer should be visible
 * @param {number} [animationDuration=300] - Exit animation duration in ms
 * @returns {boolean} isVisible - Whether the drawer DOM should be mounted
 */
export function useDrawerVisibility(isOpen, animationDuration = 300) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, animationDuration]);

  return isVisible;
}
