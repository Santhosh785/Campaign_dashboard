ALTER TABLE shopify_events
ADD COLUMN IF NOT EXISTS cart_items jsonb DEFAULT '[]'::jsonb;
