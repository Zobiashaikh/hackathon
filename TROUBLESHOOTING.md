# Troubleshooting Guide

## "Failed to fetch" Error When Signing Up/Logging In

### If you see `ERR_NAME_NOT_RESOLVED`:

This means the Supabase domain cannot be found. **Most likely your project is PAUSED!**

**Quick Fix:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Check if your project shows "Paused" status
3. If paused, click **"Resume"** button
4. Wait 2-3 minutes for the project to fully start
5. Try signing up again

**Alternative causes:**
- Project URL is incorrect (check Settings → API)
- Project was deleted
- Typo in the project ID

---

This error typically means the app cannot connect to Supabase. Here's how to fix it:

### Step 1: Check Your Environment Variables

1. **Verify your `.env` file exists** in the root directory (same level as `package.json`)

2. **Check the file contents** - it should look like this:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_GEMINI_API_KEY=your-gemini-key-here
   ```

3. **Important checks:**
   - ✅ No spaces around the `=` sign
   - ✅ No quotes around the values (unless they're part of the actual value)
   - ✅ No trailing spaces
   - ✅ File is named exactly `.env` (not `.env.txt` or `.env.local`)

### Step 2: Verify Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** - it should look like: `https://xxxxxxxxxxxxx.supabase.co`
5. Copy the **anon public** key (not the service_role key!)

### Step 3: Restart Your Development Server

**This is critical!** Vite only loads environment variables when the server starts.

1. Stop your dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab:

- ✅ If you see `✅ Supabase client initialized` - the connection is working
- ❌ If you see `❌ VITE_SUPABASE_URL is missing!` - your `.env` file isn't being read
- ❌ If you see network errors - check your Supabase URL

### Step 5: Verify Supabase Project Status

1. Go to your Supabase dashboard
2. Check if your project is **paused** (free projects pause after 1 week of inactivity)
3. If paused, click **Resume** to reactivate it
4. Wait a few minutes for the project to fully start

### Step 6: Check Network Tab

1. Open Developer Tools → **Network** tab
2. Try signing up again
3. Look for failed requests to `supabase.co`
4. Check the error message:
   - **CORS error**: Your Supabase URL might be wrong
   - **404 Not Found**: Project doesn't exist or URL is incorrect
   - **401 Unauthorized**: Anon key is wrong

### Step 7: Test Supabase Connection

Create a test file to verify your connection:

```typescript
// test-supabase.ts (temporary file - delete after testing)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseAnonKey)
console.log('Key length:', supabaseAnonKey?.length)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Connection error:', error)
  } else {
    console.log('✅ Connection successful!')
  }
})
```

## Common Issues and Solutions

### Issue: "Missing Supabase environment variables"

**Solution:**
- Make sure `.env` file is in the root directory
- Restart the dev server after creating/modifying `.env`
- Check for typos in variable names (must be exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)

### Issue: Environment variables are undefined

**Solution:**
- In Vite, environment variables MUST start with `VITE_` prefix
- Restart the dev server after adding variables
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: "Invalid API key" or "Invalid URL"

**Solution:**
- Double-check you copied the **anon public** key (not service_role)
- Verify the URL doesn't have trailing slashes
- Make sure there are no extra spaces in your `.env` file

### Issue: CORS errors

**Solution:**
- This usually means the Supabase URL is incorrect
- Verify the URL in your Supabase dashboard matches your `.env` file
- Make sure you're using the correct project

### Issue: Project is paused

**Solution:**
- Free Supabase projects pause after 1 week of inactivity
- Go to your Supabase dashboard and click **Resume**
- Wait 2-3 minutes for the project to fully start

## Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Check the terminal** where your dev server is running for errors
3. **Verify your Supabase project** is active and running
4. **Try creating a new Supabase project** if the current one has issues
5. **Check your internet connection** - Supabase requires an active connection

## Quick Checklist

Before asking for help, make sure you've:

- [ ] Created `.env` file in the root directory
- [ ] Added `VITE_SUPABASE_URL` with your project URL
- [ ] Added `VITE_SUPABASE_ANON_KEY` with your anon key
- [ ] Restarted the dev server after adding environment variables
- [ ] Checked that your Supabase project is active (not paused)
- [ ] Verified credentials in Supabase dashboard Settings → API
- [ ] Checked browser console for specific error messages
- [ ] Tried clearing browser cache

