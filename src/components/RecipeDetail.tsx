import Link from "next/link";
import { type RecipeDetail as RecipeDetailType } from "@/lib/supabase/recipes";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-zinc-700"}>
          ★
        </span>
      ))}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function RecipeDetail({ recipe, showBackLink = true }: { recipe: RecipeDetailType; showBackLink?: boolean }) {
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const hasNutrition = recipe.nut_calories != null || recipe.nut_protein != null;

  const nutritionRows: { label: string; value: string }[] = [
    recipe.nut_calories     != null && { label: "Calories",      value: `${recipe.nut_calories} kcal` },
    recipe.nut_protein      != null && { label: "Protein",        value: `${recipe.nut_protein}g` },
    recipe.nut_total_fat    != null && { label: "Fat",            value: `${recipe.nut_total_fat}g` },
    recipe.nut_saturated_fat != null && { label: "Saturated fat", value: `${recipe.nut_saturated_fat}g` },
    recipe.nut_total_carb   != null && { label: "Carbs",          value: `${recipe.nut_total_carb}g` },
    recipe.nut_dietary_fiber != null && { label: "Fiber",         value: `${recipe.nut_dietary_fiber}g` },
    recipe.nut_sugars       != null && { label: "Sugars",         value: `${recipe.nut_sugars}g` },
    recipe.nut_sodium       != null && { label: "Sodium",         value: `${recipe.nut_sodium}mg` },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="h-full overflow-y-auto bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Hero image */}
      {recipe.photo_urls[0] && (
        <img
          src={recipe.photo_urls[0]}
          alt={recipe.name}
          className="mb-8 h-72 w-full rounded-2xl object-cover"
        />
      )}
        {/* Back link */}
        {showBackLink && (
          <Link
            href="/recipes"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Recipes
          </Link>
        )}

        {/* Title + meta */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <StarRating rating={recipe.rating} />
            {recipe.is_favourite && (
              <span className="text-sm text-amber-400">♥ Favourite</span>
            )}
          </div>
          <h1 className="mb-4 text-3xl font-bold text-zinc-100">{recipe.name}</h1>
          <div className="flex flex-wrap gap-2">
            {recipe.courses.map((c) => <Pill key={c} label={c} />)}
            {recipe.categories.map((c) => <Pill key={c} label={c} />)}
          </div>
        </div>

        {/* Body: two columns */}
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          {/* Left: time + nutrition */}
          <div className="flex flex-col gap-6">
            <Section title="Time">
              <dl className="space-y-1.5 text-sm">
                {recipe.prep_time_minutes != null && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-400">Prep</dt>
                    <dd className="text-zinc-100">{recipe.prep_time_minutes} min</dd>
                  </div>
                )}
                {recipe.cook_time_minutes != null && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-400">Cook</dt>
                    <dd className="text-zinc-100">{recipe.cook_time_minutes} min</dd>
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="flex justify-between border-t border-zinc-800 pt-1.5">
                    <dt className="text-zinc-400">Total</dt>
                    <dd className="font-medium text-zinc-100">{totalTime} min</dd>
                  </div>
                )}
              </dl>
            </Section>

            {recipe.yield && (
              <Section title="Yield">
                <p className="text-sm text-zinc-100">{recipe.yield}</p>
              </Section>
            )}

            {hasNutrition && (
              <Section title="Nutrition">
                {recipe.nut_serving_size != null && (
                  <p className="mb-2 text-xs text-zinc-500">
                    Per {recipe.nut_serving_size}g serving
                  </p>
                )}
                <dl className="space-y-1.5 text-sm">
                  {nutritionRows.map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <dt className="text-zinc-400">{label}</dt>
                      <dd className="text-zinc-100">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}

            {recipe.source && (
              <Section title="Source">
                {/^https?:\/\//.test(recipe.source) ? (
                  <a
                    href={recipe.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-zinc-400 underline hover:text-zinc-200 transition-colors"
                  >
                    {recipe.source}
                  </a>
                ) : (
                  <p className="break-all text-sm text-zinc-400">{recipe.source}</p>
                )}
              </Section>
            )}
          </div>

          {/* Right: ingredients + directions + notes */}
          <div className="flex flex-col gap-8">
            <Section title="Ingredients">
              <ul className="space-y-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-100">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />
                    {ing}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Directions">
              <ol className="space-y-4">
                {recipe.directions.map((step, i) => (
                  <li key={i} className="flex gap-4 text-sm text-zinc-100">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </Section>

            {recipe.notes && (
              <Section title="Notes">
                <p className="text-sm leading-relaxed text-zinc-300">{recipe.notes}</p>
              </Section>
            )}
          </div>
        </div>

        {recipe.photo_urls.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Photos
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
              {recipe.photo_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${recipe.name} photo ${i + 1}`}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
