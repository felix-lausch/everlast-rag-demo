import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export interface RecipeMatch {
  id:                string;
  name:              string;
  photo_urls:        string[];
  courses:           string[];
  categories:        string[];
  ingredients:       string[];
  directions:        string[];
  notes:             string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  rating:            number | null;
  nut_calories:      number | null;
  nut_protein:       number | null;
  similarity:        number;
}

export interface RecipeTile {
  id:           string;
  name:         string;
  courses:      string[];
  categories:   string[];
  is_favourite: boolean;
  photo_urls:   string[];
}

export interface RecipeDetail {
  id:                string;
  name:              string;
  is_favourite:      boolean;
  rating:            number;
  courses:           string[];
  categories:        string[];
  source:            string | null;
  yield:             string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  ingredients:       string[];
  directions:        string[];
  notes:             string | null;
  nut_calories:      number | null;
  nut_protein:       number | null;
  nut_total_fat:     number | null;
  nut_saturated_fat: number | null;
  nut_total_carb:    number | null;
  nut_dietary_fiber: number | null;
  nut_sugars:        number | null;
  nut_sodium:        number | null;
  nut_serving_size:  number | null;
  photo_urls:        string[];
}

export async function getRecipeById(id: string): Promise<RecipeDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, name, is_favourite, rating, courses, categories, source, yield, prep_time_minutes, cook_time_minutes, ingredients, directions, notes, nut_calories, nut_protein, nut_total_fat, nut_saturated_fat, nut_total_carb, nut_dietary_fiber, nut_sugars, nut_sodium, nut_serving_size, photo_urls")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getRecipeById error:", error.message);
    return null;
  }

  return data as RecipeDetail;
}

export async function getRecipeByIdClient(id: string): Promise<RecipeDetail | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, name, is_favourite, rating, courses, categories, source, yield, prep_time_minutes, cook_time_minutes, ingredients, directions, notes, nut_calories, nut_protein, nut_total_fat, nut_saturated_fat, nut_total_carb, nut_dietary_fiber, nut_sugars, nut_sodium, nut_serving_size, photo_urls")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as RecipeDetail;
}

export async function getAllRecipes(): Promise<RecipeTile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, name, courses, categories, is_favourite, photo_urls")
    .order("name");

  if (error) {
    console.error("getAllRecipes error:", error.message);
    return [];
  }

  return (data as RecipeTile[]) ?? [];
}

