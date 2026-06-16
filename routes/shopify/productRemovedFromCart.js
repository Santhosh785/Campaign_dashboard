import { Router } from 'express';
import supabase from '../../db/supabase.js';
import { formatPhone } from '../../utils/formatPhone.js';

const router = Router();

router.post('/', async (req, res) => {
  const { eventType, data } = req.body;
  const product = data?.cartLine?.merchandise?.product;
  const phone = formatPhone(req.body.phone);

  console.log('[Shopify] product_removed_from_cart:', product?.title, '|', phone);

  // Fetch existing cart_items
  const { data: existing } = await supabase
    .from('shopify_events')
    .select('cart_items')
    .eq('phone', phone)
    .single();

  const prevItems = existing?.cart_items || [];
  const cart_items = prevItems.filter(i => i.product_id !== product?.id);

  const { error } = await supabase.from('shopify_events').upsert({
    phone,
    event_type: eventType,
    cart_items,
    data,
  }, { onConflict: 'phone' });

  if (error) console.error('[Supabase] Update failed:', error.message);

  res.sendStatus(200);
});

export default router;
