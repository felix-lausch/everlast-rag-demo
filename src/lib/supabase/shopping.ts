import { createClient } from "@/lib/supabase/server";

export interface ShoppingItem {
  id:       string;
  item:     string;
  quantity: string | null;
}

export async function getShoppingList(): Promise<ShoppingItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shopping_list")
    .select("id, item, quantity")
    .order("item");

  if (error) {
    console.error("getShoppingList error:", error.message);
    return [];
  }

  return (data as ShoppingItem[]) ?? [];
}

export async function addShoppingItem(
  item: string,
  quantity: string | null
): Promise<ShoppingItem[]> {
  const supabase = createClient();
  await supabase.from("shopping_list").insert({ item, quantity });
  return getShoppingList();
}

export async function removeShoppingItem(item: string): Promise<ShoppingItem[]> {
  const supabase = createClient();
  await supabase.from("shopping_list").delete().ilike("item", item);
  return getShoppingList();
}

export async function updateShoppingItem(
  id: string,
  item: string,
  quantity: string | null
): Promise<ShoppingItem[]> {
  const supabase = createClient();
  await supabase.from("shopping_list").update({ item, quantity }).eq("id", id);
  return getShoppingList();
}
