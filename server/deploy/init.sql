-- Sprint100 Database Initialization Script
-- This script runs when PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE sprint100'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sprint100')\gexec

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE sprint100 TO sprint100_user;
