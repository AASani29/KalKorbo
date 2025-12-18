# Issue Tracker Setup Guide

This is a collaborative issue tracking application built with React, TypeScript, and Supabase.

## Prerequisites

- Node.js (v18 or higher)
- A Supabase account (free tier works fine)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Option A: Create a New Supabase Project (Recommended)

1. Go to [https://supabase.com](https://supabase.com) and sign in/sign up
2. Click "New Project"
3. Fill in the project details:
   - **Name**: TrackerForURewards (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Wait for the project to be created (takes ~2 minutes)

#### Option B: Use Supabase CLI (Alternative)

If you prefer using the CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to existing project or create new one
supabase init
supabase link --project-ref your-project-ref
```

### 3. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 4. Configure Environment Variables

1. Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run Database Migrations

You need to create the database tables. There are two ways to do this:

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20251218104210_create_issue_tracker_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" message

#### Option B: Using Supabase CLI

```bash
# Make sure you're linked to your project
supabase db push
```

### 6. Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `profiles`
   - `projects`
   - `project_members`
   - `tasks`

### 7. Start the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`

## First Time Usage

1. **Sign Up**: Create a new account using the sign-up form
2. **Create a Project**: Click "New Project" to create your first project
3. **Add Tasks**: Click the "+" button in any column (To Do, In Progress, Done) to create tasks
4. **Invite Team Members**: Click the "Team" button to add collaborators (they need to sign up first)

## Features

- ✅ User authentication (sign up/sign in)
- ✅ Create and manage multiple projects
- ✅ Kanban-style task board (To Do, In Progress, Done)
- ✅ Task priority levels (Low, Medium, High)
- ✅ Assign tasks to team members
- ✅ Real-time updates
- ✅ Team collaboration
- ✅ Project color customization

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure your `.env` file exists in the root directory
- Verify the variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating/editing `.env`

### Database errors when signing up

- Make sure you ran the migration SQL script
- Check that all tables exist in the Supabase Table Editor
- Verify Row Level Security (RLS) is enabled on all tables

### Can't see projects or tasks

- Make sure you're logged in
- Check browser console for errors
- Verify your Supabase credentials are correct

### Real-time updates not working

- Check that your Supabase project has Realtime enabled (it's on by default)
- Verify you're on the same project in different browser tabs/windows

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Hooks

## Project Structure

```
TrackerForURewards/
├── src/
│   ├── components/          # React components
│   │   ├── Auth.tsx        # Authentication UI
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── TaskBoard.tsx   # Kanban board
│   │   ├── TaskCard.tsx    # Individual task card
│   │   ├── CreateTaskModal.tsx
│   │   ├── EditTaskModal.tsx
│   │   ├── CreateProjectModal.tsx
│   │   └── ManageMembersModal.tsx
│   ├── lib/                # Utilities and configs
│   │   ├── supabase.ts    # Supabase client & types
│   │   └── auth.tsx       # Auth context & hooks
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── supabase/
│   └── migrations/        # Database migrations
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Support

If you encounter any issues, check:
1. Browser console for JavaScript errors
2. Supabase dashboard logs for database errors
3. Network tab for API request failures
