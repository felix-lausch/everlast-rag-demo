import { getAllRecipes } from "@/lib/supabase/recipes";
import RecipeBrowser from "@/components/RecipeBrowser";

export default async function RecipesPage() {
  const recipes = await getAllRecipes();
  return <RecipeBrowser recipes={recipes} />;
}
