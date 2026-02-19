"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ListItem {
  id:       string;
  name:     string;
  quantity: string | null;
}

interface Props {
  title:         string;
  emptyMessage:  string;
  items:         ListItem[];
  addAction:     (formData: FormData) => Promise<void>;
  removeAction:  (formData: FormData) => Promise<void>;
  updateAction:  (formData: FormData) => Promise<void>;
  checkable?:    boolean;
}

function ItemRow({
  item,
  removeAction,
  updateAction,
  checkable,
  checked,
  onToggle,
}: {
  item:         ListItem;
  removeAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  checkable:    boolean;
  checked:      boolean;
  onToggle:     () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="flex items-center gap-2 px-4 py-3">
        <form
          action={async (fd) => { await updateAction(fd); setEditing(false); }}
          className="flex flex-1 items-center gap-2"
        >
          <input type="hidden" name="id" value={item.id} />
          <input
            name="name"
            required
            defaultValue={item.name}
            className="
              flex-1 rounded border border-zinc-600 bg-zinc-800
              px-2 py-1 text-sm text-zinc-100 focus:border-zinc-400 focus:outline-none
            "
          />
          <input
            name="quantity"
            defaultValue={item.quantity ?? ""}
            placeholder="Qty"
            className="
              w-24 rounded border border-zinc-600 bg-zinc-800
              px-2 py-1 text-sm text-zinc-100 placeholder:text-zinc-500
              focus:border-zinc-400 focus:outline-none
            "
          />
          <button
            type="submit"
            className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Save
          </button>
        </form>
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        {checkable && (
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="h-5 w-5 accent-zinc-400 cursor-pointer"
          />
        )}
        <span className={cn(
          "text-sm transition-colors",
          checked ? "text-zinc-500 line-through" : "text-zinc-100"
        )}>
          {item.name}
          {item.quantity && (
            <span className="ml-2 text-zinc-500">{`(${item.quantity})`}</span>
          )}
        </span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          Edit
        </button>
        <form action={removeAction}>
          <input type="hidden" name="name" value={item.name} />
          <button
            type="submit"
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </form>
      </div>
    </li>
  );
}

export default function ItemListManager({
  title,
  emptyMessage,
  items,
  addAction,
  removeAction,
  updateAction,
  checkable = false,
}: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-xl font-semibold text-zinc-100">{title}</h1>

          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">{emptyMessage}</p>
          ) : (
            <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  removeAction={removeAction}
                  updateAction={updateAction}
                  checkable={checkable}
                  checked={checked.has(item.id)}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 px-4 py-4">
        <form action={addAction} className="mx-auto flex max-w-2xl gap-2">
          <input
            name="name"
            required
            placeholder="Item name"
            className="
              flex-1 rounded-xl border border-zinc-700 bg-zinc-900
              px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500
              focus:outline-none focus:ring-2 focus:ring-zinc-600
            "
          />
          <input
            name="quantity"
            placeholder="Qty (optional)"
            className="
              w-32 rounded-xl border border-zinc-700 bg-zinc-900
              px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500
              focus:outline-none focus:ring-2 focus:ring-zinc-600
            "
          />
          <button
            type="submit"
            className="
              rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium
              text-zinc-900 transition-colors hover:bg-zinc-300
            "
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
