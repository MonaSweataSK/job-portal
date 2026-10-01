CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    salary_min DECIMAL(12, 2),
    salary_max DECIMAL(12, 2),
    posted_at TIMESTAMP DEFAULT now(),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cover_letter TEXT,
    photo_url VARCHAR(1024),
    photo_key VARCHAR(1024),
    applied_at TIMESTAMP DEFAULT now(),
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_job_email ON applications(job_id, email);
