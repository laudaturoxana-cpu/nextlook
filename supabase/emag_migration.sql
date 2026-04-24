-- eMAG sync fields on products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS emag_seller_id INTEGER UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS emag_category_id INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS emag_sync_status VARCHAR(20) DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS emag_synced_at TIMESTAMP WITH TIME ZONE;

-- Sequence for unique eMAG seller IDs
CREATE SEQUENCE IF NOT EXISTS emag_seller_id_seq START 1001;
