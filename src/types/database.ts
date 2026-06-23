export const COFFEE_SIZES_GRAMS = [150, 250, 500, 1000] as const;
export type CoffeeSizeGrams = (typeof COFFEE_SIZES_GRAMS)[number];

export const MIN_COFFEE_IMAGES = 3;
export const MAX_COFFEE_IMAGES = 6;

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
  short_description: string;
  long_description: string;
  extended_content_url: string;
  extended_content_catch_text: string;
  origin: string;
  varietal: string;
  beneficio: string;
  altitude: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CoffeeImageRow = {
  id: string;
  coffee_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type CoffeeVariantRow = {
  id: string;
  coffee_id: string;
  size_grams: CoffeeSizeGrams;
  price: number;
  is_available: boolean;
};

export type CoffeeInsert = Omit<CoffeeRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CoffeeUpdate = Partial<CoffeeInsert>;

export type EducationNoteRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  content_before_image: string;
  content_after_image: string;
  source: string;
  nombre: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type EducationNoteInsert = Omit<
  EducationNoteRow,
  "id" | "created_at" | "updated_at" | "source" | "nombre" | "content_before_image" | "content_after_image"
> & {
  id?: string;
  source?: string;
  nombre?: string;
  content_before_image?: string;
  content_after_image?: string;
  created_at?: string;
  updated_at?: string;
};

export type EducationNoteUpdate = Partial<EducationNoteInsert>;

export type EducationNoteImageRow = {
  id: string;
  education_note_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  is_inline: boolean;
  created_at: string;
};

export type CustomerOrderStatus = "pending" | "completed" | "cancelled";

export type CustomerOrderRow = {
  id: string;
  order_number: number;
  order_code: number;
  status: CustomerOrderStatus;
  items: Json;
  total: number;
  whatsapp_message: string;
  created_at: string;
};

export type CustomerOrderInsert = {
  order_number?: number;
  order_code?: number;
  items: Json;
  total: number;
  whatsapp_message: string;
  status?: CustomerOrderStatus;
  id?: string;
  created_at?: string;
};

export type CustomerOrderUpdate = Partial<CustomerOrderInsert>;

export type Database = {
  public: {
    Tables: {
      coffees: {
        Row: CoffeeRow;
        Insert: CoffeeInsert;
        Update: CoffeeUpdate;
        Relationships: [];
      };
      coffee_images: {
        Row: CoffeeImageRow;
        Insert: Omit<CoffeeImageRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CoffeeImageRow>;
        Relationships: [];
      };
      coffee_variants: {
        Row: CoffeeVariantRow;
        Insert: Omit<CoffeeVariantRow, "id"> & { id?: string };
        Update: Partial<CoffeeVariantRow>;
        Relationships: [];
      };
      education_notes: {
        Row: EducationNoteRow;
        Insert: EducationNoteInsert;
        Update: EducationNoteUpdate;
        Relationships: [];
      };
      education_note_images: {
        Row: EducationNoteImageRow;
        Insert: Omit<EducationNoteImageRow, "id" | "created_at" | "is_primary" | "is_inline"> & {
          id?: string;
          is_primary?: boolean;
          is_inline?: boolean;
          created_at?: string;
        };
        Update: Partial<EducationNoteImageRow>;
        Relationships: [];
      };
      customer_orders: {
        Row: CustomerOrderRow;
        Insert: CustomerOrderInsert;
        Update: CustomerOrderUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
