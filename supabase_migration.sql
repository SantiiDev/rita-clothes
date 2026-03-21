-- Migration: Add quantity column to products table
-- Run this SQL in the Supabase SQL Editor

-- Step 1: Add the quantity column with a default of 1
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Step 2: Set all existing products to quantity = 1
UPDATE products
  SET quantity = 1
  WHERE quantity IS NULL OR quantity = 0;
