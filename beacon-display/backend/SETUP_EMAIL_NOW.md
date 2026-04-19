# 🔧 IMMEDIATE ACTION NEEDED: Update Your Gmail Credentials

## Current Issue
Your `.env` file still has **placeholder values**. Email sending will fail until you add real credentials.

**Current values:**
```
EMAIL_USER=your-email@gmail.com       ❌ PLACEHOLDER
EMAIL_PASS=your-app-password-here     ❌ PLACEHOLDER
```

---

## ✅ Quick Fix (5 Minutes)

### Step 1: Set Up Gmail (One-time only)
1. Go to: **https://myaccount.google.com**
2. Click **"Security"** on the left
3. Under "How you sign in to Google", enable **"2-Step Verification"**
   - Follow the prompts to verify your phone
4. You should now see **"App passwords"** option (if not, 2FA might not be fully enabled yet)
5. Click **"App passwords"**
6. Select: **Mail** and **Windows Computer**
7. Google generates a **16-character password** 
8. **COPY THIS PASSWORD** (with or without spaces)

### Step 2: Update Your `.env` File
Open `backend/.env` and replace with your ACTUAL credentials:

**Before:**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

**After (Example):**
```
EMAIL_USER=john.doe@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

⚠️ **Important**: Use the **App Password** (16 chars), NOT your regular Gmail password

### Step 3: Restart Backend
Stop the backend server (Ctrl+C) and restart:
```bash
npm run dev
```

### Step 4: Test It!
1. Try "Forgot Password" again
2. **Check your email inbox** ✉️
3. If no email arrives:
   - Check **SPAM folder**
   - Check **backend console** for detailed error messages

---

## 🔍 Debugging from Console

After updating .env, when you request a password reset, the backend should show:

**If successful:**
```
📧 Attempting to send reset code email to john.doe@gmail.com...
✅ Reset email sent successfully!
Message ID: <xxxxx>
```

**If it fails, you'll see:**
```
❌ EMAIL SENDING FAILED
Error: [specific error message]

Common causes:
1. Incorrect EMAIL_USER or EMAIL_PASS in .env
2. 2-Factor Authentication not enabled on Gmail account
3. Using regular password instead of App Password
4. Gmail blocking the connection (check Gmail security alerts)
5. Less secure apps not enabled
```

---

## ✨ Development Mode Fallback

If email doesn't work, the **6-digit code IS AVAILABLE IN THE CONSOLE**.

Look for:
```
========== PASSWORD RESET CODE ==========
Email: john.doe@gmail.com
Reset Code: 123456
Expires in: 1 hour
==========================================
```

**Copy this code** and test your password reset flow!

---

## ❓ Common Issues & Fixes

### "App passwords" option not showing
- 2-Factor Authentication might not be fully active
- Wait 5 minutes and refresh the page
- Or skip to the "Less Secure Apps" method below

### Less Secure Apps Method (Alternative)
If you can't use App Passwords:
1. Go to: **https://myaccount.google.com/apppasswords**
2. Enable "Less secure app access"
3. Use your **regular Gmail password** in .env instead

### Email goes to SPAM
- Add this to your email client's whitelist
- Or ask Gmail to move it to inbox next time

### Still not working?
1. Check EMAIL_USER and EMAIL_PASS are correct
2. Restart the backend
3. Check browser console for error messages
4. Check backend console for detailed error logs

---

## ✅ Production Deployment (Vercel + Render)

Once working locally, deploy to production:

1. Go to **Render Dashboard**
2. Select your backend service
3. Go to **Environment**
4. Add the same credentials:
   ```
   EMAIL_USER = john.doe@gmail.com
   EMAIL_PASS = abcd efgh ijkl mnop
   NODE_ENV = production
   ```
5. Deploy and test!

---

## 🎉 You're Done!

Once email is sending:
1. Users can request password resets ✅
2. They receive codes via email ✅
3. They can reset their passwords ✅
4. Works on Vercel + Render ✅

Need help? Check the error messages in your backend console - they'll tell you what's wrong!
