"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { type RecipeTile as RecipeTileType } from "@/lib/supabase/recipes";
import RecipeTile from "./RecipeTile";

type Grouping = "all" | "favourites" | "course" | "category";

const TABS: { label: string; value: Grouping }[] = [
  { label: "All",         value: "all" },
  { label: "Favourites",  value: "favourites" },
  { label: "By Course",   value: "course" },
  { label: "By Category", value: "category" },
];

function groupBy(recipes: RecipeTileType[], key: "courses" | "categories") {
  const map = new Map<string, RecipeTileType[]>();
  for (const recipe of recipes) {
    for (const value of recipe[key]) {
      if (!map.has(value)) map.set(value, []);
      map.get(value)!.push(recipe);
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function TileGrid({ recipes }: { recipes: RecipeTileType[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
      {recipes.map((r) => (
        <RecipeTile key={r.id} recipe={r} />
      ))}
    </div>
  );
}

export default function RecipeBrowser({ recipes }: { recipes: RecipeTileType[] }) {
  const [grouping, setGrouping] = useState<Grouping>("all");

  const favourites = recipes.filter((r) => r.is_favourite);
  const groups = groupBy(
    recipes,
    grouping === "course" ? "courses" : "categories"
  );

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 px-6 py-6">
      <div className="mx-auto max-w-5xl">
        {/* Segmented control */}
        <div className="mb-6 flex gap-2">
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setGrouping(value)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                grouping === value
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {grouping === "all" && <TileGrid recipes={recipes} />}

        {grouping === "favourites" && (
          favourites.length > 0
            ? <TileGrid recipes={favourites} />
            : <p className="text-sm text-zinc-500">No favourites yet.</p>
        )}

        {(grouping === "course" || grouping === "category") &&
          groups.map(([label, group]) => (
            <section key={label}>
              <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {label}
              </h2>
              <TileGrid recipes={group} />
            </section>
          ))
        }
      </div>
    </div>
  );
}
