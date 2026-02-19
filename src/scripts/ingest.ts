import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { load, type CheerioAPI } from "cheerio";
import type { SupabaseClient } from "@supabase/supabase-js";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Nutrition, Recipe, RecipeRow } from "../types/recipe";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "recipe-images";
const IMAGES_DIR = path.resolve(process.cwd(), "sourcedata/images");
const HTML_PATH =
  process.argv[2] ??
  path.resolve(process.cwd(), "sourcedata/partial_recipes.html");

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function parseDurationToMinutes(iso: string | undefined): number | null {
  if (!iso || iso === "PT0S" || iso === "PT0M") return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  const total = hours * 60 + minutes + Math.round(seconds / 60);
  return total === 0 ? null : total;
}

function parseNutrition(
  nutVal: (itemprop: string) => number | null
): Nutrition | null {
  const calories = nutVal("recipeNutCalories");
  const protein = nutVal("recipeNutProtein");
  const totalFat = nutVal("recipeNutTotalFat");
  if (calories === null && protein === null && totalFat === null) return null;

  return {
    calories,
    totalFat,
    saturatedFat: nutVal("recipeNutSaturatedFat"),
    sodium: nutVal("recipeNutSodium"),
    totalCarb: nutVal("recipeNutTotalCarbohydrate"),
    dietaryFiber: nutVal("recipeNutDietaryFiber"),
    sugars: nutVal("recipeNutSugars"),
    protein,
    servingSize: nutVal("recipeNutServingSize"),
  };
}

function parseRecipes(html: string): Recipe[] {
  const $ = load(html);
  const recipes: Recipe[] = [];

  $("div.recipe-details").each((_i, el) => {
    const $recipe = $(el);

    const id = $recipe.find('meta[itemprop="recipeId"]').attr("content") ?? "";
    const name = $recipe.find('h2[itemprop="name"]').text().trim();
    if (!id || !name) return;

    const isFavourite =
      $recipe.find('meta[itemprop="recipeIsFavourite"]').attr("content") ===
      "True";
    const rating = parseInt(
      $recipe.find('meta[itemprop="recipeRating"]').attr("content") ?? "0",
      10
    );
    const courses: string[] = [];
    const spanCourse = $recipe.find('span[itemprop="recipeCourse"]').text().trim();
    if (spanCourse) courses.push(spanCourse);
    $recipe.find('meta[itemprop="recipeCourse"]').each((_j, metaEl) => {
      const val = $(metaEl).attr("content")?.trim();
      if (val && !courses.includes(val)) courses.push(val);
    });

    const categories: string[] = [];
    $recipe.find('meta[itemprop="recipeCategory"]').each((_j, metaEl) => {
      const cat = $(metaEl).attr("content")?.trim();
      if (cat) categories.push(cat);
    });

    const $sourceSpan = $recipe.find('span[itemprop="recipeSource"]');
    const source =
      $sourceSpan.find("a").attr("href") ||
      $sourceSpan.text().trim() ||
      null;

    const yieldText = $recipe
      .find('span[itemprop="recipeYield"]')
      .text()
      .trim();

    const prepTimeMinutes = parseDurationToMinutes(
      $recipe.find('meta[itemprop="prepTime"]').attr("content")
    );
    const cookTimeMinutes = parseDurationToMinutes(
      $recipe.find('meta[itemprop="cookTime"]').attr("content")
    );

    const ingredients: string[] = [];
    $recipe
      .find('div[itemprop="recipeIngredients"] > p')
      .each((_j, pEl) => {
        const text = $(pEl).text().trim();
        if (text) ingredients.push(text);
      });

    const directions: string[] = [];
    $recipe
      .find('div[itemprop="recipeDirections"] > p')
      .each((_j, pEl) => {
        const text = $(pEl).text().trim();
        if (text) directions.push(text);
      });

    const noteLines: string[] = [];
    $recipe.find('div[itemprop="recipeNotes"] > p').each((_j, pEl) => {
      const text = $(pEl).text().trim();
      if (text) noteLines.push(text);
    });

    // Gallery photos are canonical; fall back to single .recipe-photo
    const photoFilenames: string[] = [];
    $recipe
      .find(".recipe-photos-div img.recipe-photos")
      .each((_j, imgEl) => {
        const src = $(imgEl).attr("src");
        if (src) photoFilenames.push(src.replace(/^images\//, ""));
      });
    if (photoFilenames.length === 0) {
      const mainSrc = $recipe.find("img.recipe-photo").attr("src");
      if (mainSrc) photoFilenames.push(mainSrc.replace(/^images\//, ""));
    }

    recipes.push({
      id,
      name,
      isFavourite,
      rating,
      courses,
      categories,
      source,
      yield: yieldText || null,
      prepTimeMinutes,
      cookTimeMinutes,
      ingredients,
      directions,
      notes: noteLines.length > 0 ? noteLines.join("\n") : null,
      nutrition: parseNutrition((itemprop) => {
        const val = $recipe.find(`meta[itemprop="${itemprop}"]`).attr("content");
        if (!val) return null;
        const n = parseFloat(val);
        return isNaN(n) ? null : n;
      }),
      photoFilenames,
      photoUrls: [],
    });
  });

  return recipes;
}

// ---------------------------------------------------------------------------
// Image upload
// ---------------------------------------------------------------------------

async function uploadRecipeImages(
  supabase: SupabaseClient,
  recipe: Recipe
): Promise<string[]> {
  const urls: string[] = [];

  for (const filename of recipe.photoFilenames) {
    const localPath = path.join(IMAGES_DIR, filename);

    try {
      await fs.access(localPath);
    } catch {
      console.warn(`    Image not found on disk, skipping: ${filename}`);
      continue;
    }

    const fileBuffer = await fs.readFile(localPath);
    const storagePath = `${recipe.id}/${filename}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, { contentType: "image/jpeg", upsert: true });

    if (error) {
      console.error(`    Upload failed for ${filename}:`, error.message);
      continue;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    urls.push(data.publicUrl);
  }

  return urls;
}

// ---------------------------------------------------------------------------
// Embedding
// ---------------------------------------------------------------------------

function buildEmbeddingText(recipe: Recipe): string {
  const parts: string[] = [`Recipe: ${recipe.name}`];
  if (recipe.courses.length) parts.push(`Courses: ${recipe.courses.join(", ")}`);
  if (recipe.categories.length)
    parts.push(`Categories: ${recipe.categories.join(", ")}`);
  if (recipe.yield) parts.push(`Serves: ${recipe.yield}`);
  if (recipe.ingredients.length)
    parts.push(`Ingredients:\n${recipe.ingredients.join("\n")}`);
  if (recipe.directions.length)
    parts.push(`Directions:\n${recipe.directions.join("\n")}`);
  if (recipe.notes) parts.push(`Notes:\n${recipe.notes}`);
  return parts.join("\n\n");
}

async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });
  return embedding;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log(`Parsing: ${HTML_PATH}`);
  const html = await fs.readFile(HTML_PATH, "utf-8");
  const recipes = parseRecipes(html);
  console.log(`Found ${recipes.length} recipes.\n`);

  for (const recipe of recipes) {
    console.log(`→ ${recipe.name}`);

    recipe.photoUrls = await uploadRecipeImages(supabase, recipe);
    console.log(`  Photos: ${recipe.photoUrls.length} uploaded`);

    const embedding = await generateEmbedding(buildEmbeddingText(recipe));
    console.log(`  Embedding: ${embedding.length} dimensions`);

    const row: RecipeRow = {
      id:                recipe.id,
      name:              recipe.name,
      is_favourite:      recipe.isFavourite,
      rating:            recipe.rating,
      courses:           recipe.courses,
      categories:        recipe.categories,
      source:            recipe.source,
      yield:             recipe.yield,
      prep_time_minutes: recipe.prepTimeMinutes,
      cook_time_minutes: recipe.cookTimeMinutes,
      ingredients:       recipe.ingredients,
      directions:        recipe.directions,
      notes:             recipe.notes,
      nut_calories:      recipe.nutrition?.calories     ?? null,
      nut_total_fat:     recipe.nutrition?.totalFat     ?? null,
      nut_saturated_fat: recipe.nutrition?.saturatedFat ?? null,
      nut_sodium:        recipe.nutrition?.sodium       ?? null,
      nut_total_carb:    recipe.nutrition?.totalCarb    ?? null,
      nut_dietary_fiber: recipe.nutrition?.dietaryFiber ?? null,
      nut_sugars:        recipe.nutrition?.sugars       ?? null,
      nut_protein:       recipe.nutrition?.protein      ?? null,
      nut_serving_size:  recipe.nutrition?.servingSize  ?? null,
      photo_urls:        recipe.photoUrls,
      embedding,
    };

    const { error } = await supabase
      .from("recipes")
      .upsert(row, { onConflict: "id" });

    if (error) console.error(`  Upsert failed:`, error.message);
    else console.log(`  Upserted ✓`);

    // Courtesy delay between OpenAI embedding calls
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\nIngestion complete.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
