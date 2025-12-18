# 🔧 Troubleshooting: 500 Error When Creating Projects

## Problem
Getting `500 Internal Server Error` when trying to create a project:
```
POST https://yeaavqmdlytoraegptxg.supabase.co/rest/v1/projects 500
```

## Root Cause
The database migration wasn't run properly, or the RLS policies are blocking inserts.

## ✅ Solution (Follow These Steps)

### Step 1: Verify Database Setup

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `verify-database.sql`
5. Click **Run**

**Expected Result:**
- All 4 tables should show "✓ EXISTS"
- All tables should have `rls_enabled = true`
- Should see policies listed for each table

### Step 2: Run Clean Migration

If Step 1 shows missing tables or policies:

1. In **SQL Editor**, click **New Query**
2. Copy and paste **ALL** contents from `clean-migration.sql`
3. Click **Run** (or press Ctrl+Enter)
4. Wait for "Success" message
5. Scroll down to see verification results

**Expected Result:**
```
table_name       | exists
-----------------|-------
profiles         | 1
projects         | 1
project_members  | 1
tasks            | 1
```

### Step 3: Verify Tables in Table Editor

1. Go to **Table Editor** in Supabase dashboard
2. You should see these 4 tables:
   - ✅ profiles
   - ✅ projects
   - ✅ project_members
   - ✅ tasks

### Step 4: Test Again

1. Go back to your app (http://localhost:5173)
2. Refresh the page (Ctrl+R)
3. Try creating a project again

## 🎯 Quick Fix Checklist

- [ ] Ran `clean-migration.sql` in Supabase SQL Editor
- [ ] Verified all 4 tables exist in Table Editor
- [ ] Confirmed RLS is enabled on all tables
- [ ] Refreshed the app in browser
- [ ] Tried creating a project again

## 🔍 Additional Checks

### Check Your Profile Exists

After signing up, verify your profile was created:

1. In Supabase **Table Editor**
2. Click on **profiles** table
3. You should see your user record

If your profile is missing, the signup didn't complete properly.

### Check Authentication

1. In Supabase dashboard → **Authentication** → **Users**
2. You should see your user account listed
3. Status should be "Confirmed" (green)

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for detailed error messages
4. Share any error messages you see

## 🚨 Common Issues

### Issue: "new row violates row-level security policy"
**Solution:** The RLS policies aren't set up correctly. Run `clean-migration.sql` again.

### Issue: "relation 'projects' does not exist"
**Solution:** The table wasn't created. Run `clean-migration.sql`.

### Issue: "insert or update on table violates foreign key constraint"
**Solution:** Your profile doesn't exist. Sign out and sign up again.

## 📝 Files Created to Help

1. **`verify-database.sql`** - Check if database is set up correctly
2. **`clean-migration.sql`** - Complete migration that fixes everything
3. This troubleshooting guide

## 💡 Pro Tip

If you're still having issues after running the clean migration:

1. Go to Supabase **SQL Editor**
2. Run this quick test:
```sql
-- Test if you can insert a project
INSERT INTO projects (name, description, owner_id)
VALUES ('Test Project', 'Testing', auth.uid())
RETURNING *;
```

If this works, the issue is in the frontend code. If it fails, there's still a database issue.

## 🆘 Still Not Working?

Share these details:
1. Screenshot of Table Editor showing your tables
2. Error message from browser console
3. Result of running `verify-database.sql`
