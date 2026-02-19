"use server";

import { upsertPantryItem, removePantryItem, updatePantryItem } from "@/lib/supabase/pantry";
import { revalidatePath } from "next/cache";

export async function addItemAction(formData: FormData) {
  const name = formData.get("name") as string;
  const quantity = (formData.get("quantity") as string) || null;
  if (name?.trim()) await upsertPantryItem(name.trim(), quantity?.trim() || null);
  revalidatePath("/pantry");
}

export async function removeItemAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (name) await removePantryItem(name);
  revalidatePath("/pantry");
}

export async function updateItemAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const quantity = (formData.get("quantity") as string) || null;
  if (id && name?.trim()) await updatePantryItem(id, name.trim(), quantity?.trim() || null);
  revalidatePath("/pantry");
}
