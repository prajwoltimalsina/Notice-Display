# Quick Start Guide - Role-Based Authentication System

## 🚀 For the Impatient: 5-Minute Overview

### The Problem
Users were logging in as both admin AND regular user at the same time with no way to distinguish the session type.

### The Solution
Clear role-based system:
- **Regular User**: Role = `user`, Approved = `true` → Can login immediately
- **Admin**: Role = `admin`, Approved = `false` → Blocked until you approve them
- **Approved Admin**: Role = `admin`, Approved = `true` → Full admin access

---

## 🎯 First Time Setup

### Step 1: Deploy Changes
The code is ready to go. No migration needed.

### Step 2: Create Your Admin Account
1. Go to the Auth page
2. Click "Sign Up"
3. Register with your email
4. You'll be the first user → **automatically admin + approved**
5. Log in successfully
6. Start managing the system

### Step 3: Done! ✅
You now have a working role-based admin system.

---

## 📝 Common Tasks

### I'm the admin. How do I approve new admins?

**Step 1**: Someone registers with role "admin"
- They see: "Your admin account is pending approval"
- They get NO token
- They cannot log in

**Step 2**: You check pending approvals
```bash
curl -X GET http://localhost:5000/api/auth/admin/pending-approvals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 3**: You approve them
```bash
curl -X PATCH http://localhost:5000/api/auth/admin/USER_ID/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 4**: They can now log in ✅

---

### I'm a new admin. Why can't I log in?

**Answer**: Your admin account is pending approval. Contact an existing admin.

When you try to log in:
```json
{
  "message": "Admin access pending approval. Please contact the administrator.",
  "pendingApproval": true
}
```

The admin needs to call `/api/auth/admin/:yourId/approve`

---

### I'm a regular user. How do I use the system?

1. Register with role "user" (or leave default)
2. Get token immediately ✅
3. Log in and use the system
4. You cannot access admin features (they're blocked for non-admins)

---

## 🔍 How to Check User Status

### From Database
```javascript
// Check if user is approved admin
db.users.findOne({ email: "admin@example.com" })

// Response shows:
{
  role: "admin",
  isApproved: true,      // ← This is the key
  approvedAt: Date(...),
  approvedBy: ObjectId(...)
}
```

### From API
```bash
# Get your own status
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛡️ Security in Plain English

**Three things needed to access admin features:**

1. ✅ Have a valid login token
2. ✅ Have role = "admin"
3. ✅ Have isApproved = true

**If ANY of these is missing → Access DENIED (403 error)**

---

## 📋 API Quick Reference

### User Registration
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "admin" or "user"  # optional, default is "user"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### View Pending Admins
```bash
GET /api/auth/admin/pending-approvals
Header: Authorization: Bearer <YOUR_ADMIN_TOKEN>
```

### Approve Admin
```bash
PATCH /api/auth/admin/USER_ID/approve
Header: Authorization: Bearer <YOUR_ADMIN_TOKEN>
```

### Reject Admin
```bash
PATCH /api/auth/admin/USER_ID/reject
Header: Authorization: Bearer <YOUR_ADMIN_TOKEN>
```

---

## 🧪 Quick Test

### Test 1: Admin Access Works
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get token from response
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Access admin feature
curl -X GET http://localhost:5000/api/notices \
  -H "Authorization: Bearer $TOKEN"

# Should work! ✅
```

### Test 2: Unapproved Admin Blocked
```bash
# Try to login as unapproved admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newadmin@example.com","password":"password123"}'

# Response: 403 - "Admin access pending approval"
# No token provided ✅
```

### Test 3: Regular User Blocked from Admin
```bash
# Login as regular user
TOKEN="user_token..."

# Try to access admin feature
curl -X GET http://localhost:5000/api/notices \
  -H "Authorization: Bearer $TOKEN"

# Response: 403 - "Access denied. Admin only." ✅
```

---

## 🎓 Understanding the System in 60 Seconds

```
Registration:
  User registers as "user" → Approved automatically → Can login
  User registers as "admin" → NOT approved → Cannot login until approved

Login:
  Try to login → Check if approved → If yes: get token → Success
                → If no: blocked (403) → Cannot login

Admin Routes:
  Try to access → Check token exists → Check role="admin" → Check approved=true
                  → If all 3 pass: access allowed
                  → If any fail: 403 error
```

---

## ❓ FAQ

**Q: Can regular users see admin UI?**
A: No, the UI should check `isAdminApproved` before showing admin features.

**Q: Can an admin remove their own admin role?**
A: No, prevented by `removeAdmin()` function.

**Q: What happens if the first user is deleted?**
A: The next admin registration would require approval from other admins. First-user-auto-approve is one-time only.

**Q: Can I change an admin back to a regular user?**
A: Yes, use `PATCH /api/auth/admin/:userId/remove`

**Q: What if I lose my admin token?**
A: Just log in again. You're still an admin.

**Q: How long is a token valid?**
A: 7 days. After that, you need to log in again.

**Q: Can I have multiple admin accounts?**
A: Yes, just approve multiple users with role="admin".

---

## 🚨 If Something Goes Wrong

### Problem: First user not getting token
**Solution**: 
1. Check database: `db.users.findOne()` 
2. Verify `isApproved: true`
3. If not, manually update: `db.users.updateOne({...}, {$set: {isApproved: true}})`

### Problem: Approved admin can't access notices
**Solution**:
1. Check token is valid
2. Check user has `role: "admin"` AND `isApproved: true`
3. Check authMiddleware and adminMiddleware are applied to route

### Problem: New admin can't log in
**Solution**:
1. Check if they registered with role="admin"
2. Call GET `/api/auth/admin/pending-approvals`
3. If they're there, approve them with PATCH `/api/auth/admin/:id/approve`

### Problem: Token not being sent to backend
**Solution**:
1. Check Authorization header format: `Bearer <token>`
2. Check token isn't expired
3. Check it's being sent in requests: `curl -H "Authorization: Bearer token" ...`

---

## 📚 Need More Details?

- **Full Implementation**: See [AUTHENTICATION_IMPLEMENTATION.md](AUTHENTICATION_IMPLEMENTATION.md)
- **Admin Workflow**: See [ADMIN_APPROVAL_GUIDE.md](ADMIN_APPROVAL_GUIDE.md)
- **All API Endpoints**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Architecture**: See [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)
- **Frontend Code**: See [FRONTEND_INTEGRATION_EXAMPLES.md](FRONTEND_INTEGRATION_EXAMPLES.md)

---

## ✅ You're Ready!

The system is deployed and working. Start by:
1. ✅ Register as first admin (you)
2. ✅ Approve any pending admins as they register
3. ✅ Regular users can register and use the system
4. ✅ Your system now has proper role-based authentication

**That's it! No more ambiguous login sessions.** 🎉
