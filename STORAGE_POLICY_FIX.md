# Fix for Storage RLS Policy Error

If you're getting the error: **"new row violates row-level security policy"** when uploading PDFs, follow these steps:

## Quick Fix

1. Go to your Supabase Dashboard → **Storage** → **Policies** for the `pdfs` bucket

2. **Delete all existing policies** for the `pdfs` bucket (if any)

3. **Create these 3 policies** using the SQL Editor (easier than the UI):

   Go to **SQL Editor** → **New Query** → Paste and run:

```sql
-- Policy 1: Allow users to upload PDFs to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to view PDFs in their own folder
CREATE POLICY "Users can view own PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to delete PDFs in their own folder
CREATE POLICY "Users can delete own PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

4. **Click Run** to execute the SQL

## Alternative: Simpler Policy (If above doesn't work)

If the folder-based policy doesn't work, use this simpler approach that checks if the path contains the user ID:

```sql
-- Delete old policies first
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own PDFs" ON storage.objects;

-- Create new policies
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pdfs' 
  AND name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "Users can view own PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pdfs' 
  AND name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "Users can delete own PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pdfs' 
  AND name LIKE auth.uid()::text || '/%'
);
```

## Verify the Fix

1. Try uploading a PDF again
2. Check the browser console - you should see "PDF uploaded successfully" 
3. Check your Dashboard - the PDF should appear

## Troubleshooting

### Still getting errors?

1. **Check bucket exists**: Go to Storage → Make sure `pdfs` bucket exists
2. **Check bucket is private**: The bucket should be **Private** (not public)
3. **Check you're authenticated**: Make sure you're logged in when uploading
4. **Check user ID format**: In browser console, check what `user.id` looks like - it should be a UUID

### Check Current Policies

Run this in SQL Editor to see your current policies:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### Reset Everything

If nothing works, you can temporarily disable RLS for testing (NOT recommended for production):

```sql
-- ONLY FOR TESTING - Remove in production!
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

Then re-enable and add proper policies:

```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Then add the policies above
```

