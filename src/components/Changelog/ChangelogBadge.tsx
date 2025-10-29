"use client";

import { useEffect, useState } from "react";
import { getUnreadChangelogsCount } from "@/lib/changelog-utils";

interface ChangelogBadgeProps {
  className?: string;
}

export function ChangelogBadge({ className = "" }: ChangelogBadgeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Get initial count
    const unreadCount = getUnreadChangelogsCount();
    setCount(unreadCount);

    // Listen for storage events (in case user opens multiple tabs)
    const handleStorageChange = () => {
      const newCount = getUnreadChangelogsCount();
      setCount(newCount);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also refresh count when window gains focus
    const handleFocus = () => {
      const newCount = getUnreadChangelogsCount();
      setCount(newCount);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (count === 0) {
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5
        text-xs font-semibold text-white
        bg-red-500 rounded-full
        ${className}
      `}
      aria-label={`${count} actualizaciones sin leer`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
