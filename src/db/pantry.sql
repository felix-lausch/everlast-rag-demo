CREATE TABLE public.pantry (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  quantity text,
  CONSTRAINT pantry_pkey PRIMARY KEY (id)
);