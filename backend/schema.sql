-- Taste Map Database Schema
-- Run in Supabase SQL Editor to recreate the database

-- searches: stores each search made by a user
CREATE TABLE searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- results: stores restaurant results for each search
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID REFERENCES searches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  rating NUMERIC,
  price TEXT,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);