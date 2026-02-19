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
        <img
          src={recipe.photo_urls[0] ?? "/file.svg"}
          alt={recipe.name}
          className={recipe.photo_urls[0] ? "absolute inset-0 h-full w-full object-cover" : "p-8"}
          />
      </div>
      <p className="truncate text-xs font-medium leading-tight text-white">
        {recipe.name}
      </p>
    </Link>
  );
}
