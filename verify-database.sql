-- Database Verification Script
-- Run this in Supabase SQL Editor to check if tables exist

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public'
        ) THEN '✓ EXISTS'
        ELSE '✗ MISSING'
    END as status
FROM (
    VALUES 
        ('profiles'),
        ('projects'),
        ('project_members'),
        ('tasks')
) AS t(table_name);

-- Check RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'projects', 'project_members', 'tasks');

-- Count policies
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename;
