import { Router } from 'express';
import supabase from '../../db/supabase.js';
import { formatPhone } from '../../utils/formatPhone.js';

const router = Router();

router.post('/', async (req, res) => {
  const { eventType, data } = req.body;
  const product = data?.productVariant?.product;
  const variant = data?.productVariant;
  const phone = formatPhone(req.body.phone);
  if (!phone) return res.sendStatus(200);

  console.log('[Shopify] product_viewed:', product?.title, '|', phone);

  const { error } = await supabase.from('shopify_events').upsert({
    tracking_id: req.body.trackingId,
    phone,
    name: req.body.name,
    event_type: eventType,
    product_id: product?.id,
    product_name: product?.title,
    variant_id: variant?.id,
    price: variant?.price?.amount,
    currency: variant?.price?.currencyCode,
    page_url: req.body.pageUrl,
    data,
  }, { onConflict: 'phone' });

  if (error) console.error('[Supabase] Insert failed:', error.message);

  res.sendStatus(200);
});

export default router;
