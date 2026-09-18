-- 01_initial_schema.sql
-- Run this in the Supabase SQL Editor to initialize the database

CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    support INTEGER NOT NULL DEFAULT 0,
    batteries INTEGER NOT NULL DEFAULT 0,
    story_stage TEXT DEFAULT 'STORM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT,
    timer_seconds INTEGER,
    total_colonists INTEGER,
    required_support INTEGER DEFAULT 0,
    mission_order INTEGER
);

CREATE TABLE IF NOT EXISTS player_progress (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
    unlocked BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    best_survivors INTEGER DEFAULT 0,
    best_time INTEGER,
    robots_recovered INTEGER DEFAULT 0,
    communications_restored BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (player_id, mission_id)
);

CREATE TABLE IF NOT EXISTS mission_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
    survivors INTEGER DEFAULT 0,
    robots_saved INTEGER DEFAULT 0,
    communications_restored BOOLEAN DEFAULT FALSE,
    completion_time INTEGER,
    support_earned INTEGER DEFAULT 0,
    batteries_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_robots (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    robot_type TEXT,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    PRIMARY KEY (player_id, robot_type)
);

-- Basic Indexes
CREATE INDEX IF NOT EXISTS idx_player_progress_player_id ON player_progress(player_id);
CREATE INDEX IF NOT EXISTS idx_mission_results_player_id ON mission_results(player_id);
