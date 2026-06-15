import { Router } from 'express';
import supabase from '../db/supabase.js';
import { formatPhone } from '../utils/formatPhone.js';

const router = Router();

router.post('/', async (req, res) => {
  const rawPhone = req.body?.phone;

  // Filter bots
  if (!rawPhone || rawPhone === '--sanitized--' || rawPhone.includes('{{')) {
    return res.sendStatus(200);
  }

  const phone = formatPhone(rawPhone);

  const {
    name, event_type,
    time_spent_seconds, scroll_depth_percent,
    scroll_count, refresh_count,
    shared, timestamp
  } = req.body;

  const mins = Math.floor(time_spent_seconds / 60);
  const secs = time_spent_seconds % 60;

  // Log to console
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

  // Save to Supabase — upsert by phone, no duplicate rows
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

  if (error) {
    console.error('[Supabase] Insert failed:', error.message);
  }

  res.sendStatus(200);
});

export default router;
