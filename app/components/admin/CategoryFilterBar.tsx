"use client";

import { memo } from "react";

export type CategoryChip = { name: string; count: number };

/* Horizontal, scrollable category filter. The "All" entry is just another chip
   (the page prepends it). Selecting a chip filters the list instantly — the
   page owns state + the URL; this only reports the click. */
function CategoryFilterBar({
  categories,
  active,
  onSelect,
}: {
  categories: CategoryChip[];
  active: string;
  onSelect: (name: string) => void;
}) {
  if (categories.length <= 1) return null;

  return (
    <div className="admin-cat-bar" role="tablist" aria-label="Filter products by category">
      {categories.map((c) => {
        const isActive = c.name.toLowerCase() === active.toLowerCase();
        return (
          <button
            key={c.name}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`admin-cat-chip${isActive ? " active" : ""}`}
            onClick={() => onSelect(c.name)}
          >
            {c.name}
            <span className="admin-cat-chip-count">{c.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(CategoryFilterBar);
