import { getPantry } from "@/lib/supabase/pantry";
import ItemListManager from "@/components/ItemListManager";
import { addItemAction, removeItemAction, updateItemAction } from "./actions";

export default async function PantryPage() {
  const items = await getPantry();
  return (
    <ItemListManager
      title="Pantry"
      emptyMessage="Your pantry is empty."
      items={items}
      addAction={addItemAction}
      removeAction={removeItemAction}
      updateAction={updateItemAction}
    />
  );
}
