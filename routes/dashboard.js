import { Router } from 'express';
import supabase from '../db/supabase.js';

const router = Router();

router.get('/students', async (req, res) => {
  const { data, error } = await supabase
    .from('student_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/shopify', async (req, res) => {
  const { data, error } = await supabase
    .from('shopify_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/students/:id', async (req, res) => {
  const { error } = await supabase
    .from('student_events')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(200);
});

router.delete('/shopify/:id', async (req, res) => {
  const { error } = await supabase
    .from('shopify_events')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(200);
});

export default router;
