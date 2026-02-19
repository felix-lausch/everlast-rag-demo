"use server";

import { addShoppingItem, removeShoppingItem, updateShoppingItem } from "@/lib/supabase/shopping";
import { revalidatePath } from "next/cache";

export async function addItemAction(formData: FormData) {
  const name = formData.get("name") as string;
  const quantity = (formData.get("quantity") as string) || null;
  if (name?.trim()) await addShoppingItem(name.trim(), quantity?.trim() || null);
  revalidatePath("/shopping");
}

export async function removeItemAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (name) await removeShoppingItem(name);
  revalidatePath("/shopping");
}

export async function updateItemAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const quantity = (formData.get("quantity") as string) || null;
  if (id && name?.trim()) await updateShoppingItem(id, name.trim(), quantity?.trim() || null);
  revalidatePath("/shopping");
}
