-- Add PDF content URL to learning chapters
ALTER TABLE learning_chapters
  ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);
