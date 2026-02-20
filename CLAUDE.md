# Project Overview
Retrieval Augmented Generation Usecase based on Recipe Library.

How the RAG Architecture Would Work

Embed:
- Ingredient list
- Title
- Tags
- Summary

Store structured metadata separately

On query:
- Filter by hard constraints (SQL)
- Semantic search for soft match (pgvector)

Feed:
- Structured fields
- Retrieved recipes
- User constraints

Generate structured output (JSON)

**High-Leverage Combinations**\
Most powerful combo:
- Structured filtering (SQL)
- Semantic retrieval (vector)
- LLM reasoning layer

Do NOT rely purely on embeddings.
Use SQL for:
- Calories
- Cuisine
- Prep time
- Dietary tags

Use embeddings for:
- Flavor similarity
- Intent fuzziness
- Style matching

# Behavior
Dont make code changes without me telling you to, especially not when im asking a question.

# Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database/Auth**: Supabase
- **Styling**: Tailwind CSS, shadcn/ui
- **Package Manager**: npm

# Project Structure
- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — Reusable React components
- `src/lib/` — Utilities, helpers, and shared logic
- `src/lib/supabase/` — Supabase client and server helpers
- `src/types/` — Shared TypeScript types and interfaces

# Code Style & Conventions

## TypeScript
- Use strict TypeScript; avoid `any`
- Prefer `interface` over `type` for object shapes
- Export types from `types/` directory
- Use Zod for runtime validation of external data

## React & Next.js
- Use Server Components by default; add `"use client"` only when necessary
- Prefer async Server Components for data fetching over useEffect
- Use Next.js `<Image>` for images and `<Link>` for navigation
- Keep components small and focused; extract logic into hooks or utils
- Name component files with PascalCase, utility files with camelCase

## Supabase
- Use the **server client** (`createServerClient`) in Server Components and API routes
- Use the **browser client** (`createBrowserClient`) in Client Components
- Always handle Supabase errors explicitly — don't swallow them
- Use Row Level Security (RLS) on all tables; never bypass it
- Generate and commit updated types with: `pnpm supabase gen types`

## Tailwind
- Use Tailwind utility classes directly; avoid custom CSS unless necessary
- Keep class names readable — break long className strings into multiple lines
- Use `cn()` (clsx + tailwind-merge) for conditional classes

# Environment Variables
- Never hardcode secrets or API keys
- Document all required env vars in `.env.example`
- Supabase vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

# Common Patterns

## Data Fetching (Server Component)
```tsx
const { data, error } = await supabase.from("table").select("*");
if (error) throw error;
```

## Protected Routes
Use Supabase middleware (`middleware.ts`) to protect routes and refresh sessions.

## Form Handling
Prefer Next.js Server Actions for mutations; use `useFormState` / `useActionState` for feedback.

# What to Avoid
- Don't use `getServerSideProps` or `getStaticProps` (Pages Router patterns)
- Don't fetch data in Client Components when a Server Component would work
- Don't store sensitive data in `localStorage` or client-accessible cookies
- Don't use `supabase.auth.admin` methods on the client side