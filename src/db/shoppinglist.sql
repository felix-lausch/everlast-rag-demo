CREATE TABLE public.shopping_list (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item text NOT NULL,
  quantity text,
  CONSTRAINT shopping_list_pkey PRIMARY KEY (id)
);