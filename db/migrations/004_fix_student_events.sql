-- Remove duplicate rows, keep only the latest per phone
DELETE FROM student_events
WHERE id NOT IN (
  SELECT MAX(id) FROM student_events GROUP BY phone
);

-- Add unique constraint on phone
ALTER TABLE student_events
DROP CONSTRAINT IF EXISTS student_events_phone_key;

ALTER TABLE student_events
ADD CONSTRAINT student_events_phone_key UNIQUE (phone);
