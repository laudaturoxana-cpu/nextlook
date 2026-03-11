-- Tabel pentru analytics în timp real
CREATE TABLE IF NOT EXISTS analytics_events (
  id        bigserial PRIMARY KEY,
  event_type    text NOT NULL,  -- 'page_view' | 'product_view' | 'category_view' | 'add_to_cart'
  page_path     text,
  product_id    uuid,
  product_name  text,
  category_name text,
  created_at    timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Oricine poate insera (pentru tracking anonim)
CREATE POLICY "allow_insert_analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Oricine poate citi (admin panel)
CREATE POLICY "allow_read_analytics" ON analytics_events
  FOR SELECT USING (true);

-- Activează Realtime pe acest tabel
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;

-- Șterge automat evenimentele mai vechi de 7 zile (opțional, rulează manual sau via cron)
-- DELETE FROM analytics_events WHERE created_at < now() - interval '7 days';
