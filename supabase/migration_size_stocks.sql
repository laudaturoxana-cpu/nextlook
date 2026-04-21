-- Migration: Add per-size stock tracking to products
-- Run this in Supabase SQL Editor

-- 1. Add size_stocks column (stores per-size inventory counts)
-- Format: {"36": 3, "37": 2, "38": 0, "39": 5}
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_stocks JSONB DEFAULT '{}';

-- 2. Atomic function to decrement stock (prevents race conditions)
CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id UUID,
  p_size TEXT,
  p_quantity INTEGER
) RETURNS VOID AS $$
DECLARE
  current_size_stock INTEGER;
BEGIN
  -- Get current size stock (with row lock to prevent race conditions)
  SELECT COALESCE((size_stocks->>p_size)::INTEGER, 0)
  INTO current_size_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Update both total stock and per-size stock atomically
  UPDATE products
  SET
    stock_quantity = GREATEST(0, stock_quantity - p_quantity),
    size_stocks = CASE
      WHEN p_size IS NOT NULL AND p_size != ''
      THEN jsonb_set(
        COALESCE(size_stocks, '{}'),
        ARRAY[p_size],
        TO_JSONB(GREATEST(0, current_size_stock - p_quantity))
      )
      ELSE COALESCE(size_stocks, '{}')
    END,
    updated_at = NOW()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute to service role (used by admin client)
GRANT EXECUTE ON FUNCTION decrement_product_stock TO service_role;
GRANT EXECUTE ON FUNCTION decrement_product_stock TO authenticated;

-- IMPORTANT: After running this migration, go to each product in Admin
-- and set the initial size_stocks values, for example:
-- UPDATE products SET size_stocks = '{"36": 2, "37": 3, "38": 1}'::jsonb WHERE slug = 'botine-negre';
