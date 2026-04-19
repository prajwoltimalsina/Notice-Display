# Email Configuration Guide - Password Reset

This guide will help you set up email sending for password reset functionality.

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com
2. Click on "Security" in the left sidebar
3. Under "How you sign in to Google," enable "2-Step Verification"

### Step 2: Generate App Password
1. Go back to Security settings
2. Look for "App passwords" (only shows if 2FA is enabled)
3. Select "Mail" and "Windows Computer" (or your device)
4. Google will generate a 16-character password
5. Copy this password

### Step 3: Update .env File
Open `backend/.env` and update:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  (the 16-character app password)
```

### Step 4: Install Dependencies
Run in the backend folder:
```bash
npm install
```

### Step 5: Test It
1. Start the backend: `npm run dev`
2. Try to reset a password
3. Check your email inbox for the reset code
4. If email doesn't arrive, check the backend console for the code

## For Production (Vercel + Render)

### Using Environment Variables
1. Set these on your Render backend dashboard:
   - `EMAIL_USER=your-email@gmail.com`
   - `EMAIL_PASS=your-app-password`
   - `NODE_ENV=production`

2. The email sending will be enabled automatically

### Alternative Email Services
You can also use:
- **SendGrid**: https://sendgrid.com (free up to 100 emails/day)
- **Brevo (Sendinblue)**: https://www.brevo.com (free tier available)
- **AWS SES**: https://aws.amazon.com/ses/

## Troubleshooting

### "Failed to send email" in console
- Check that APP PASSWORD is correct (not your regular Gmail password)
- Verify 2-Factor Authentication is enabled
- Make sure EMAIL_USER and EMAIL_PASS are set in .env

### Email arrives late
- Gmail might delay emails by a few minutes
- Check spam/junk folder

### Development Mode
- If email isn't configured, the reset code displays in the backend console
- Look for the blue box with "PASSWORD RESET CODE"

## Security Note
- Never use your regular Gmail password - always use an App Password
- Keep your .env file private and never commit it to git
