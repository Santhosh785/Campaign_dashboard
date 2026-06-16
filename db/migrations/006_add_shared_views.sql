ALTER TABLE student_events
ADD COLUMN IF NOT EXISTS shared_views int DEFAULT 0;
