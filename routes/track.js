import { Router } from 'express';
import supabase from '../db/supabase.js';
import { formatPhone } from '../utils/formatPhone.js';
import { findBiginContactByPhone, updateBiginContactField } from '../utils/zoho.js';
import { sendSlackNotification } from '../utils/slack.js';

const router = Router();

router.post('/', async (req, res) => {
  console.log('[TRACK] Incoming body:', JSON.stringify(req.body));

  const rawPhone = req.body?.phone;

  // Filter bots and invalid numbers
  if (!rawPhone || rawPhone === '--sanitized--' || rawPhone.includes('{{')) {
    console.log('[TRACK] Filtered — invalid phone:', rawPhone);
    return res.sendStatus(200);
  }
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length < 10) {
    console.log('[TRACK] Filtered — too short:', rawPhone);
    return res.sendStatus(200);
  }

  const phone = formatPhone(rawPhone);

  const {
    name, event_type,
    time_spent_seconds, scroll_depth_percent,
    scroll_count, refresh_count,
    shared, timestamp
  } = req.body;

  // Check if this phone has already shared — if so, this is a shared visitor
  if (event_type === 'page_open') {
    const { data: existing } = await supabase
      .from('student_events')
      .select('shared, shared_views')
      .eq('phone', phone)
      .single();

    if (existing?.shared === true) {
      // Shared visitor — just increment the counter, don't touch original data
      const newCount = (existing.shared_views || 0) + 1;
      await supabase
        .from('student_events')
        .update({ shared_views: newCount })
        .eq('phone', phone);

      console.log(`[TRACK] Shared visitor on ${phone} — shared_views: ${newCount}`);
      return res.sendStatus(200);
    }
  }

  const mins = Math.floor(time_spent_seconds / 60);
  const secs = time_spent_seconds % 60;

  if (event_type === 'scroll_update') {
    console.log(`[SCROLL] ${name} (${phone}) — depth: ${scroll_depth_percent}% | scrolls: ${scroll_count} | time: ${mins}m ${secs}s`);
  } else {
    console.log('─────────────────────────────────────');
    console.log(`Event       : ${event_type}`);
    console.log(`Name        : ${name}`);
    console.log(`Phone       : ${phone}`);
    console.log(`Time Spent  : ${mins}m ${secs}s`);
    console.log(`Scroll Depth: ${scroll_depth_percent}%`);
    console.log(`Scroll Count: ${scroll_count} times`);
    console.log(`Refreshes   : ${refresh_count} times`);
    console.log(`Shared      : ${shared ? 'YES' : 'No'}`);
    console.log(`Time        : ${timestamp}`);
    console.log('─────────────────────────────────────');
  }

  // Save to Supabase — upsert by phone
  const { error } = await supabase.from('student_events').upsert({
    name,
    phone,
    event_type,
    time_spent_seconds,
    scroll_depth_percent,
    scroll_count,
    refresh_count,
    shared,
    timestamp,
  }, { onConflict: 'phone' });

  if (error) console.error('[Supabase] Insert failed:', error.message);

  // On page_open, mark contact as guide viewed in Bigin
  if (event_type === 'page_open') {
    try {
      const contactId = await findBiginContactByPhone(phone);
      if (contactId) {
        await updateBiginContactField(contactId, { Potential: 'Guide Viewed' });
        console.log(`[Bigin] ✓ Potential updated to "Guide Viewed" for ${phone} (ID: ${contactId})`);
        await sendSlackNotification(`📄 *Guide Viewed*\n*Name:* ${name || 'Unknown'}\n*Phone:* ${phone}`);
      } else {
        console.log('[Bigin] No contact found for', phone);
      }
    } catch (err) {
      console.error('[Bigin] Error:', err.message);
    }
  }

  res.sendStatus(200);
});

export default router;
