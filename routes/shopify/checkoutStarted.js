import { Router } from 'express';
import supabase from '../../db/supabase.js';
import { formatPhone } from '../../utils/formatPhone.js';

const router = Router();

router.post('/', async (req, res) => {
  const { eventType, data } = req.body;
  const checkout = data?.checkout;
  const phone = formatPhone(req.body.phone);
  if (!phone) return res.sendStatus(200);

  console.log('[Shopify] checkout_started — total:', checkout?.totalPrice?.amount, '|', phone);

  const { error } = await supabase.from('shopify_events').upsert({
    tracking_id: req.body.trackingId,
    phone,
    name: req.body.name,
    event_type: eventType,
    product_id: null,
    product_name: null,
    variant_id: null,
    price: checkout?.totalPrice?.amount,
    currency: checkout?.totalPrice?.currencyCode,
    page_url: req.body.pageUrl,
    data,
  }, { onConflict: 'phone' });

  if (error) console.error('[Supabase] Insert failed:', error.message);

  res.sendStatus(200);
});

export default router;
