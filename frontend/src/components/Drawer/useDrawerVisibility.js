import { useEffect, useState } from "react";

let openDrawerCount = 0;

export function useDrawerVisibility(isOpen, animationDuration = 300) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      openDrawerCount += 1;
      document.body.style.overflow = "hidden";
    }

    return () => {
      if (!isOpen) return;
      openDrawerCount = Math.max(0, openDrawerCount - 1);
      if (openDrawerCount === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [isOpen, isVisible, animationDuration]);

  return isVisible;
}
