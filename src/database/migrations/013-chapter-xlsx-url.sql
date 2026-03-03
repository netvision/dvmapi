-- Migration 013: Add xlsx_url column to learning_chapters
-- Stores the URL of an uploaded Excel/XLSX lesson plan file for each chapter

ALTER TABLE learning_chapters
  ADD COLUMN IF NOT EXISTS xlsx_url VARCHAR(500);
