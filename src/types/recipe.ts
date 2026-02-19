export interface Nutrition {
  calories:      number | null;
  totalFat:      number | null;
  saturatedFat:  number | null;
  sodium:        number | null;
  totalCarb:     number | null;
  dietaryFiber:  number | null;
  sugars:        number | null;
  protein:       number | null;
  servingSize:   number | null;
}

export interface Recipe {
  id:               string;       // UUID from recipeId meta tag
  name:             string;
  isFavourite:      boolean;
  rating:           number;
  courses:          string[];
  categories:       string[];
  source:           string | null;
  yield:            string | null;
  prepTimeMinutes:  number | null;
  cookTimeMinutes:  number | null;
  ingredients:      string[];
  directions:       string[];
  notes:            string | null;
  nutrition:        Nutrition | null;
  photoFilenames:   string[];     // e.g. ["e0fceb1c-..._0.jpg"] — bare filename, no path
  photoUrls:        string[];     // populated after upload step
}

export interface RecipeRow {
  id:                 string;
  name:               string;
  is_favourite:       boolean;
  rating:             number;
  courses:            string[];
  categories:         string[];
  source:             string | null;
  yield:              string | null;
  prep_time_minutes:  number | null;
  cook_time_minutes:  number | null;
  ingredients:        string[];
  directions:         string[];
  notes:              string | null;
  nut_calories:       number | null;
  nut_total_fat:      number | null;
  nut_saturated_fat:  number | null;
  nut_sodium:         number | null;
  nut_total_carb:     number | null;
  nut_dietary_fiber:  number | null;
  nut_sugars:         number | null;
  nut_protein:        number | null;
  nut_serving_size:   number | null;
  photo_urls:         string[];
  embedding:          number[];   // 1536-element array
}