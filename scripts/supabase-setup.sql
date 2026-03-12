-- ============================================
-- Rita Clothes: Supabase Setup SQL
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price TEXT NOT NULL,
  colors JSONB DEFAULT '[]'::jsonb,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: public read, admin-only write
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admin insert" ON products
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'ritastudio33@gmail.com');

CREATE POLICY "Admin update" ON products
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'ritastudio33@gmail.com');

CREATE POLICY "Admin delete" ON products
  FOR DELETE USING (auth.jwt() ->> 'email' = 'ritastudio33@gmail.com');

-- 4. Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies: public read, admin upload/delete
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.jwt() ->> 'email' = 'ritastudio33@gmail.com'
  );

CREATE POLICY "Admin update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND auth.jwt() ->> 'email' = 'ritastudio33@gmail.com'
  );

CREATE POLICY "Admin delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.jwt() ->> 'email' = 'ritastudio33@gmail.com'
  );
