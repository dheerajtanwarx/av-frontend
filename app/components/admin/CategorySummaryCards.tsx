"use client";

import { memo } from "react";
import type { CategoryChip } from "./CategoryFilterBar";

/* Responsive summary cards — one per category with its product count. Clicking
   a card activates that category filter (same handler as the filter bar). The
   "All" card is excluded here; the filter bar covers it. */
function CategorySummaryCards({
  categories,
  active,
  onSelect,
}: {
  categories: CategoryChip[];
  active: string;
  onSelect: (name: string) => void;
}) {
  const cards = categories.filter((c) => c.name.toLowerCase() !== "all");
  if (cards.length === 0) return null;

  return (
    <div className="admin-cat-cards">
      {cards.map((c) => {
        const isActive = c.name.toLowerCase() === active.toLowerCase();
        return (
          <button
            key={c.name}
            type="button"
            className={`admin-cat-card${isActive ? " active" : ""}`}
            onClick={() => onSelect(c.name)}
            aria-pressed={isActive}
          >
            <span className="admin-cat-card-name">{c.name}</span>
            <span className="admin-cat-card-count">{c.count}</span>
            <span className="admin-cat-card-label">
              product{c.count === 1 ? "" : "s"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(CategorySummaryCards);
