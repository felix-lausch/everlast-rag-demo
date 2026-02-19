"use client";

import { useEffect, useState } from "react";
import { getRecipeByIdClient } from "@/lib/supabase/recipes";
import type { RecipeDetail as RecipeDetailType } from "@/lib/supabase/recipes";
import RecipeDetail from "@/components/RecipeDetail";

interface Props {
  recipeId: string;
  onClose: () => void;
}

export default function RecipePanel({ recipeId, onClose }: Props) {
  const [recipe, setRecipe] = useState<RecipeDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setRecipe(null);
    getRecipeByIdClient(recipeId).then((data) => {
      setRecipe(data);
      setLoading(false);
    });
  }, [recipeId]);

  return (
    <div className="relative flex h-full flex-col bg-zinc-950">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
        aria-label="Close panel"
      >
        ✕
      </button>

      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-zinc-500">Loading…</p>
        </div>
      )}

      {!loading && recipe && (
        <RecipeDetail recipe={recipe} showBackLink={false} />
      )}

      {!loading && !recipe && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-zinc-500">Recipe not found.</p>
        </div>
      )}
    </div>
  );
}
