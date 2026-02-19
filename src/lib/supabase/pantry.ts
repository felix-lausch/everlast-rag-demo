import { createClient } from "@/lib/supabase/server";

export interface PantryItem {
  id:       string;
  name:     string;
  quantity: string | null;
}

export async function getPantry(): Promise<PantryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pantry")
    .select("id, name, quantity")
    .order("name");

  if (error) {
    console.error("getPantry error:", error.message);
    return [];
  }

  return (data as PantryItem[]) ?? [];
}

export async function upsertPantryItem(
  name: string,
  quantity: string | null
): Promise<PantryItem[]> {
  const supabase = createClient();
  await supabase
    .from("pantry")
    .upsert({ name, quantity }, { onConflict: "name" });
  return getPantry();
}

export async function removePantryItem(name: string): Promise<PantryItem[]> {
  const supabase = createClient();
  await supabase.from("pantry").delete().ilike("name", name);
  return getPantry();
}

export async function updatePantryItem(
  id: string,
  name: string,
  quantity: string | null
): Promise<PantryItem[]> {
  const supabase = createClient();
  await supabase.from("pantry").update({ name, quantity }).eq("id", id);
  return getPantry();
}
