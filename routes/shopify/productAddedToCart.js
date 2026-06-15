import { Router } from 'express';
import supabase from '../../db/supabase.js';
import { formatPhone } from '../../utils/formatPhone.js';

const router = Router();

router.post('/', async (req, res) => {
  const { eventType, data } = req.body;
  const product = data?.cartLine?.merchandise?.product;
  const variant = data?.cartLine?.merchandise;
  const phone = formatPhone(req.body.phone);

  console.log('[Shopify] product_added_to_cart:', product?.title, '| Price:', variant?.price?.amount, '|', phone);

  // Fetch existing cart_items for this phone
  const { data: existing } = await supabase
    .from('shopify_events')
    .select('cart_items')
    .eq('phone', phone)
    .single();

  const prevItems = existing?.cart_items || [];

  // Append new product (avoid duplicate product_id)
  const newItem = {
    product_id: product?.id,
    product_name: product?.title,
    variant_id: variant?.id,
    price: variant?.price?.amount,
    currency: variant?.price?.currencyCode,
  };

  const alreadyExists = prevItems.some(i => i.product_id === newItem.product_id);
  const cart_items = alreadyExists ? prevItems : [...prevItems, newItem];

  const { error } = await supabase.from('shopify_events').upsert({
    tracking_id: req.body.trackingId,
    phone,
    name: req.body.name,
    event_type: eventType,
    page_url: req.body.pageUrl,
    cart_items,
    data,
  }, { onConflict: 'phone' });

  if (error) console.error('[Supabase] Insert failed:', error.message);

  res.sendStatus(200);
});

export default router;
