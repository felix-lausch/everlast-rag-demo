import { notFound } from "next/navigation";
import { getRecipeById } from "@/lib/supabase/recipes";
import RecipeDetail from "@/components/RecipeDetail";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();
  return <RecipeDetail recipe={recipe} />;
}
