CREATE OR REPLACE FUNCTION public.match_recipes(
  query_embedding vector DEFAULT NULL::vector,
  match_count integer DEFAULT 5,
  filter_max_cal integer DEFAULT NULL::integer,
  filter_max_time integer DEFAULT NULL::integer,
  filter_min_protein integer DEFAULT NULL::integer,
  filter_courses text[] DEFAULT NULL::text[],
  filter_categories text[] DEFAULT NULL::text[],
  filter_favourite boolean DEFAULT NULL::boolean
)
RETURNS TABLE(
  id uuid,
  name text,
  photo_urls text[],
  courses text[],
  categories text[],
  ingredients text[],
  directions text[],
  notes text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  rating integer,
  nut_calories numeric,
  similarity double precision
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    r.id, r.name, r.photo_urls, r.courses, r.categories,
    r.ingredients, r.directions, r.notes,
    r.prep_time_minutes, r.cook_time_minutes,
    r.rating, r.nut_calories,
    CASE
      WHEN query_embedding IS NULL THEN 0.0
      ELSE 1 - (r.embedding <=> query_embedding)
    END AS similarity
  FROM recipes r
  WHERE
    (filter_max_cal     IS NULL OR r.nut_calories <= filter_max_cal)
    AND (filter_max_time    IS NULL OR
         COALESCE(r.prep_time_minutes, 0) + COALESCE(r.cook_time_minutes, 0) <= filter_max_time)
    AND (filter_min_protein IS NULL OR r.nut_protein >= filter_min_protein)
    AND (filter_courses     IS NULL OR r.courses    && filter_courses)
    AND (filter_categories  IS NULL OR r.categories && filter_categories)
    AND (filter_favourite   IS NULL OR r.is_favourite = filter_favourite)
  ORDER BY
    CASE
      WHEN query_embedding IS NULL THEN r.rating::float
      ELSE 1 - (r.embedding <=> query_embedding)
    END DESC
  LIMIT match_count;
END;
$function$;