# Supabase Setup Guide

## Prerequisites

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project (you can have up to 2 active projects on the free tier)

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on **Settings** → **API**
3. Copy the following:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
     - Should look like: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key (this is your `VITE_SUPABASE_ANON_KEY`)
     - ⚠️ **IMPORTANT**: Use the **anon public** key (the long JWT token starting with `eyJ`)
     - ❌ **DO NOT** use the "publishable" key or "service_role" key
     - The anon key should be a very long string (200+ characters)

## Step 2: Set Up Environment Variables

Create a `.env` file in the root of your project (if it doesn't exist) and add:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit your `.env` file to git. It should already be in `.gitignore`.

## Step 3: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Name it: `pdfs`
4. Make it **Private** (not public)
5. Click **Create bucket**

## Step 4: Set Up Storage Policies

**⚠️ IMPORTANT**: Use the SQL Editor method below for more reliable policy setup.

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the following SQL, then click **Run**:

```sql
-- Policy 1: Allow users to upload PDFs to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pdfs' 
  AND name LIKE auth.uid()::text || '/%'
);

-- Policy 2: Allow users to view PDFs in their own folder
CREATE POLICY "Users can view own PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pdfs' 
  AND name LIKE auth.uid()::text || '/%'
);

-- Policy 3: Allow users to delete PDFs in their own folder
CREATE POLICY "Users can delete own PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pdfs' 
  AND name LIKE auth.uid()::text || '/%'
);
```

**Alternative Method (Using UI):**
1. Go to **Storage** → **Policies** for the `pdfs` bucket
2. Click **New Policy** → **For full customization**
3. For each policy (INSERT, SELECT, DELETE), use:
   - Policy name: `Users can [action] own PDFs`
   - Allowed operation: `INSERT` / `SELECT` / `DELETE`
   - Policy definition: `bucket_id = 'pdfs' AND name LIKE auth.uid()::text || '/%'`
   - Target roles: `authenticated`

**Note**: These policies ensure users can only access files in folders named with their user ID.

## Step 5: Create Database Table

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Run the following SQL to create the `user_pdfs` table:

```sql
-- Create user_pdfs table
CREATE TABLE IF NOT EXISTS public.user_pdfs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_pdfs ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own PDFs
CREATE POLICY "Users can view their own PDFs"
    ON public.user_pdfs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can only insert their own PDFs
CREATE POLICY "Users can insert their own PDFs"
    ON public.user_pdfs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can only update their own PDFs
CREATE POLICY "Users can update their own PDFs"
    ON public.user_pdfs
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy: Users can only delete their own PDFs
CREATE POLICY "Users can delete their own PDFs"
    ON public.user_pdfs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_pdfs_user_id_idx ON public.user_pdfs(user_id);
CREATE INDEX IF NOT EXISTS user_pdfs_created_at_idx ON public.user_pdfs(created_at DESC);
```

4. Click **Run** to execute the SQL

## Step 6: Enable Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Make sure **Email** is enabled
3. (Optional) Configure email templates in **Authentication** → **Email Templates**

## Step 7: Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to `/signup` and create an account
3. Check your email for the verification link (if email confirmation is enabled)
4. Sign in and try uploading a PDF

## Free Tier Limits

Supabase free tier includes:
- ✅ **50,000 monthly active users** for authentication
- ✅ **500 MB database storage**
- ✅ **1 GB file storage** (perfect for PDFs)
- ✅ **5 GB bandwidth** per month
- ✅ **Unlimited API requests**

**Note**: Free projects pause after 1 week of inactivity. You can resume them anytime from the dashboard.

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file exists in the root directory
- Verify the variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after adding environment variables

### "Storage bucket not found" error
- Make sure you created the `pdfs` bucket in Storage
- Verify the bucket name is exactly `pdfs` (lowercase)

### "Permission denied" errors
- Check that you've created all the RLS policies for the `user_pdfs` table
- Verify storage policies are set up correctly
- Make sure the user is authenticated before trying to upload

### PDFs not showing up
- Check the browser console for errors
- Verify the database table was created successfully
- Check that RLS policies allow SELECT operations

