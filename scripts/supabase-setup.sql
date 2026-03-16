-- ============================================
-- Rita Clothes: Supabase Setup SQL
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================

-- ⚠️ IMPORTANT: Replace YOUR_ADMIN_USER_UUID below with the actual UUID
-- of the admin user. Find it in: Supabase Dashboard → Authentication → Users
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

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

-- 3. RLS Policies: public read, admin-only write (using auth.uid() for security)
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admin insert" ON products
  FOR INSERT WITH CHECK (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid);

CREATE POLICY "Admin update" ON products
  FOR UPDATE USING (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid)
  WITH CHECK (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid);

CREATE POLICY "Admin delete" ON products
  FOR DELETE USING (auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid);

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

-- 5. Create storage bucket for product images (with MIME type restrictions)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('product-images', 'product-images', true, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 6. Storage policies: public read, admin upload/delete (using auth.uid())
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid
  );

CREATE POLICY "Admin update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid
  );

CREATE POLICY "Admin delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid() = 'YOUR_ADMIN_USER_UUID'::uuid
  );
