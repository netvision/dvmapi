-- Add news categories and galleries
-- Run this migration: psql -U postgres -d institute_db -f src/database/migrations/add_categories_galleries.sql

-- News Categories
CREATE TABLE IF NOT EXISTS news_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category_id);

-- News Gallery (multiple images per news)
CREATE TABLE IF NOT EXISTS news_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID REFERENCES news(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_gallery_news ON news_gallery(news_id);

-- Events Gallery (multiple images per event)
CREATE TABLE IF NOT EXISTS events_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_gallery_event ON events_gallery(event_id);

-- Insert default categories
INSERT INTO news_categories (name, slug, description) VALUES
    ('School News', 'school-news', 'General school announcements and updates'),
    ('Public Circular', 'public-circular', 'Official circulars and notices'),
    ('News Media', 'news-media', 'Press releases and media coverage'),
    ('Achievements', 'achievements', 'Student and school achievements'),
    ('Academic Updates', 'academic-updates', 'Academic calendar and updates'),
    ('Events', 'events', 'Upcoming and past events')
ON CONFLICT (slug) DO NOTHING;
