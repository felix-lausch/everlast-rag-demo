import { getShoppingList } from "@/lib/supabase/shopping";
import ItemListManager from "@/components/ItemListManager";
import { addItemAction, removeItemAction, updateItemAction } from "./actions";

export default async function ShoppingPage() {
  const raw = await getShoppingList();
  const items = raw.map(({ id, item, quantity }) => ({ id, name: item, quantity }));
  return (
    <ItemListManager
      title="Shopping List"
      emptyMessage="Your shopping list is empty."
      items={items}
      addAction={addItemAction}
      removeAction={removeItemAction}
      updateAction={updateItemAction}
      checkable
    />
  );
}
