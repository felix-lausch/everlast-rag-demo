// Auto-generate this file with: pnpm supabase gen types typescript --local > types/database.ts
export type Database = {
  public: {
    Tables: {
      shopping_list: {
        Row:           { id: string; item: string; quantity: string | null; };
        Insert:        { id?: string; item: string; quantity?: string | null; };
        Update:        { id?: string; item?: string; quantity?: string | null; };
        Relationships: [];
      };
      pantry: {
        Row:           { id: string; name: string; quantity: string | null; };
        Insert:        { id?: string; name: string; quantity?: string | null; };
        Update:        { id?: string; name?: string; quantity?: string | null; };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_recipes: {
        Args: {
          query_embedding:    number[] | null;
          match_count?:       number;
          filter_max_cal?:     number | null;
          filter_max_time?:    number | null;
          filter_min_protein?: number | null;
          filter_favourite?:   boolean | null;
        };
        Returns: {
          id:                string;
          name:              string;
          photo_urls:        string[];
          courses:           string[];
          categories:        string[];
          ingredients:       string[];
          directions:        string[];
          notes:             string | null;
          prep_time_minutes: number | null;
          cook_time_minutes: number | null;
          rating:            number | null;
          nut_calories:      number | null;
          similarity:        number;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
};
