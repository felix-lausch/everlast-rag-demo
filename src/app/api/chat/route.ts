import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, stepCountIs, UIMessage } from "ai";
import { z } from "zod";
import { searchRecipes } from "@/lib/supabase/recipes";
import { planQuery } from "@/lib/query-planner";
import {
  getShoppingList,
  addShoppingItem,
  removeShoppingItem,
  type ShoppingItem,
} from "@/lib/supabase/shopping";
import {
  getPantry,
  upsertPantryItem,
  removePantryItem,
  type PantryItem,
} from "@/lib/supabase/pantry";

export const runtime = "edge";

function formatShoppingList(items: ShoppingItem[]): string {
  if (items.length === 0) return "The shopping list is currently empty.";
  return "Shopping list:\n" + items
    .map((i) => `- ${i.item}${i.quantity ? ` (${i.quantity})` : ""}`)
    .join("\n");
}

function formatPantry(items: PantryItem[]): string {
  if (items.length === 0) return "The pantry is currently empty.";
  return "Pantry inventory:\n" + items
    .map((i) => `- ${i.name}${i.quantity ? ` (${i.quantity})` : ""}`)
    .join("\n");
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const [shoppingList, pantry] = await Promise.all([getShoppingList(), getPantry()]);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    stopWhen: stepCountIs(5),
    system: [
      "You are a helpful cooking assistant with access to the user's personal recipe book and shopping list.",
      "Use the search_recipes tool whenever the user asks about recipes, ingredients, meal ideas, or cooking.",
      "Do NOT manually list recipe Names and images in your responses, the UI automatically shows recipe cards with images. Do NOT describe, list, or narrate the recipes — just briefly acknowledge the count and offer further help.",
      "You can manage the shopping list using the manage_shopping_list tool.",
      "You can add, update, and remove items in the pantry inventory using the manage_pantry tool.",
      `\n\n${formatShoppingList(shoppingList)}`,
      `\n\n${formatPantry(pantry)}`,
      `Current date and time: ${new Date()}. Location: Germany.`,
      "Do NOT manually list recipe Names and images in your responses"
    ].join(" "),
    messages: await convertToModelMessages(messages),
    tools: {
      search_recipes: {
        description: "Search the recipe book. Use this when user asks about seeing/finding/showing recipes based on names or ingredients or courses etc. Do not execute when user message refers to recipes from before.",
        inputSchema: z.object({
          query: z.string().describe("The user's request in natural language"),
        }),
        execute: async ({ query }) => {
          console.log("EXECUTING SEARCH RECIPE");
          const plan = await planQuery(query);
          console.log(plan);
          const matches = await searchRecipes(plan, 5);
          return {
            recipes: matches,
          };
        },
      },
      manage_shopping_list: {
        description: "Add or remove an item from the shopping list. Use 'add' to add a new item or update its quantity. Use 'remove' to delete it.",
        inputSchema: z.object({
          action:   z.enum(["add", "remove"]),
          name:     z.string().describe("Item name"),
          quantity: z.string().nullable().optional().describe("Amount, e.g. '2', '500g'. Required for add."),
        }),
        execute: async ({ action, name, quantity }) => {
          console.log("EXECUTING MANAGE SHOPPING LIST", action, name);
          if (action === "add") {
            const updated = await addShoppingItem(name, quantity ?? null);
            return formatShoppingList(updated);
          } else {
            const updated = await removeShoppingItem(name);
            return formatShoppingList(updated);
          }
        },
      },
      manage_pantry: {
        description: "Add/update or remove an item in the pantry inventory. Use 'add' to add a new item or update its quantity (upserts). Use 'remove' to delete it.",
        inputSchema: z.object({
          action:   z.enum(["add", "remove"]),
          name:     z.string().describe("Ingredient or item name"),
          quantity: z.string().nullable().optional().describe("Amount, e.g. '500g', '2 cans'. Required for add."),
        }),
        execute: async ({ action, name, quantity }) => {
          console.log("EXECUTING MANAGE PANTRY", action, name);
          if (action === "add") {
            const updated = await upsertPantryItem(name, quantity ?? null);
            return formatPantry(updated);
          } else {
            const updated = await removePantryItem(name);
            return formatPantry(updated);
          }
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
