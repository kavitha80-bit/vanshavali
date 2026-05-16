-- Vanshavali Database Schema
-- Run this in Neon SQL Editor after creating your project

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- One row per family tree
CREATE TABLE trees (
  id           SERIAL PRIMARY KEY,
  share_token  TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  owner_name   TEXT,
  lang         TEXT DEFAULT 'en',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- All persons across all trees
CREATE TABLE persons (
  id          TEXT NOT NULL,  -- e.g. 'p101', matches rv_nid
  tree_id     INTEGER NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  dob         TEXT DEFAULT '',
  city        TEXT DEFAULT '',
  gotra       TEXT DEFAULT '',
  naksh       TEXT DEFAULT '',
  notes       TEXT DEFAULT '',
  is_root     BOOLEAN DEFAULT FALSE,
  is_mother   BOOLEAN,        -- null = unknown, true = female, false = male
  placeholder BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, tree_id)
);

-- All relationship edges across all trees
CREATE TABLE edges (
  id       SERIAL PRIMARY KEY,
  tree_id  INTEGER NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  a        TEXT NOT NULL,  -- person id
  b        TEXT NOT NULL,  -- person id
  t        TEXT NOT NULL   -- 'sp' | 'pc' | 'sib'
);

-- Indexes for fast lookups
CREATE INDEX idx_persons_tree ON persons(tree_id);
CREATE INDEX idx_edges_tree ON edges(tree_id);
CREATE INDEX idx_trees_token ON trees(share_token);

