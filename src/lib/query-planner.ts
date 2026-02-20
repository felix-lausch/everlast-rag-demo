import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const QueryPlanSchema = z.object({
  filters: z.object({
    max_calories:  z.number().int().positive().nullable(), // null → no filter
    max_prep_time: z.number().int().positive().nullable(), // minutes (prep + cook)
    min_protein:   z.number().int().positive().nullable(), // grams
    is_favourite:  z.boolean().nullable(),
  }),
  semantic_query: z.string().nullable(), // null → skip vector search
  mode: z.enum(["hybrid", "semantic", "sql"]),
});

export type QueryPlan = z.infer<typeof QueryPlanSchema>;

export async function planQuery(userMessage: string): Promise<QueryPlan> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: QueryPlanSchema,
    prompt: `
You are a query planner for a personal recipe book assistant.
Analyze the user's message and output a retrieval plan.

Rules:
- Use "sql" mode only when the query is entirely about structured constraints
  (e.g. "show me high protein dishes (>25g), show dishes with less than 600kcal, make a suggestion for quick meals (<30 min)").
- Use "semantic" mode for open-ended or flavour-driven queries with no hard constraints
  (e.g. "remind me of my recipes including carrots", "i got many apples from my neighbor, what can i do with them").
- Use "hybrid" mode when there are both constraints AND a flavour/style component
  (e.g. "a quick Italian dinner under 600 calories").
- Set semantic_query to null when mode is "sql".
- max_prep_time is total time (prep + cook combined) in minutes.

User message: "${userMessage}"
    `.trim(),
  });

  return object;
}
