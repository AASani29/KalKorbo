---
description: How to run the issue tracker application
---

# Running the Issue Tracker

Follow these steps to get your issue tracker up and running:

## 1. Install Dependencies (Already Done ✓)

Dependencies have been installed.

## 2. Set Up Supabase

You need a Supabase project to run this application. Choose one option:

### Option A: I don't have a Supabase project yet

1. Go to https://supabase.com and sign in/sign up
2. Click "New Project"
3. Fill in:
   - Name: TrackerForURewards
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
4. Wait ~2 minutes for project creation
5. Go to Settings → API and copy:
   - Project URL
   - anon/public key

### Option B: I already have a Supabase project

1. Go to your Supabase dashboard
2. Go to Settings → API
3. Copy your Project URL and anon/public key

## 3. Configure Environment Variables

Run the setup helper:

```powershell
./setup.ps1
```

Or manually create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Run Database Migration

1. Open your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file: `supabase/migrations/20251218104210_create_issue_tracker_schema.sql`
5. Copy ALL the contents
6. Paste into the SQL editor
7. Click **Run** (or Ctrl+Enter)
8. You should see "Success. No rows returned"

## 5. Start the Development Server

// turbo
```bash
npm run dev
```

The app will open at http://localhost:5173

## 6. First Use

1. Click "Sign Up" and create an account
2. Create your first project
3. Start adding tasks!

## Troubleshooting

- **"Missing Supabase environment variables"**: Make sure `.env` file exists and restart dev server
- **Database errors**: Make sure you ran the migration SQL
- **Can't see projects**: Check browser console for errors
