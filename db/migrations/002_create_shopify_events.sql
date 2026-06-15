create table if not exists shopify_events (
  id bigint generated always as identity primary key,
  tracking_id text,
  phone text,
  name text,
  event_type text not null,
  product_id text,
  product_name text,
  variant_id text,
  price numeric,
  currency text,
  page_url text,
  data jsonb,
  created_at timestamptz default now(),
  constraint shopify_events_phone_key unique (phone)
);
