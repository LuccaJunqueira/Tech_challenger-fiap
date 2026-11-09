"use client";

interface AriaLiveRegionProps {
  message: string | null;
  id: string;
}

export function AriaLiveRegion({ message, id }: AriaLiveRegionProps) {
  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
