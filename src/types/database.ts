export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CoffeeRow = {
  id: string;
  name: string;
  slug: string;
  codename: string | null;
  tasting_notes: string;
  description: string;
  price_250g: number;
  price_1000g: number | null;
  image_url: string | null;
  sold_out: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CoffeeInsert = Omit<
  CoffeeRow,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CoffeeUpdate = Partial<CoffeeInsert>;

export type Database = {
  public: {
    Tables: {
      coffees: {
        Row: CoffeeRow;
        Insert: CoffeeInsert;
        Update: CoffeeUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
