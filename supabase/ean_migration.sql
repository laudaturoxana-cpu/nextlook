-- Migration: Add EAN barcode field to products
-- Run this in Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS ean VARCHAR(20) DEFAULT NULL;
