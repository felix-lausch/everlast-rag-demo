import Link from "next/link";
import { RecipeTile as RecipeTileType } from "@/lib/supabase/recipes";

interface Props {
  recipe: RecipeTileType;
  onClick?: (id: string) => void;
}

export default function RecipeTile({ recipe, onClick }: Props) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex flex-col gap-1.5"
      onClick={onClick ? (e) => { e.preventDefault(); onClick(recipe.id); } : undefined}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-800">
        {recipe.photo_urls[0] && (
          <img
            src={recipe.photo_urls[0]}
            alt={recipe.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
      <p className="truncate text-xs font-medium leading-tight text-white">
        {recipe.name}
      </p>
    </Link>
  );
}
