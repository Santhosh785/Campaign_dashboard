-- Remove duplicate rows, keep only the latest per phone
DELETE FROM shopify_events
WHERE id NOT IN (
  SELECT MAX(id) FROM shopify_events GROUP BY phone
);

-- Add unique constraint on phone if not already present
ALTER TABLE shopify_events
DROP CONSTRAINT IF EXISTS shopify_events_phone_key;

ALTER TABLE shopify_events
ADD CONSTRAINT shopify_events_phone_key UNIQUE (phone);
