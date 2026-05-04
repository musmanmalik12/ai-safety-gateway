CREATE TABLE IF NOT EXISTS scan_jobs (
    id UUID PRIMARY KEY,
    status TEXT NOT NULL,
    file_path TEXT,
    input_text TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);