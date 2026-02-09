# Admin Approval System - Quick Reference Guide

## For Your First Setup

### Step 1: Create Your Initial Admin Account
1. Go to the Auth page and select "Sign Up"
2. Fill in:
   - Full Name: Your name
   - Email: Your admin email
   - Password: Strong password
3. You'll be the first user, so you're automatically:
   - Assigned admin role
   - Approved immediately
   - Can log in right away

### Step 2: Start Managing the System
Once logged in as the first admin, you can:
- Create and manage notices
- Approve future admin accounts
- Manage users

---

## For Managing Admin Approvals

### View Pending Admin Approvals
**Endpoint**: `GET /api/auth/admin/pending-approvals`
**Headers**: `Authorization: Bearer <your_token>`

```bash
curl -X GET http://localhost:5000/api/auth/admin/pending-approvals \
  -H "Authorization: Bearer your_jwt_token"
```

**Response**:
```json
{
  "message": "Pending admin approvals retrieved",
  "count": 2,
  "users": [
    {
      "_id": "user_id_1",
      "email": "admin1@example.com",
      "name": "Admin One",
      "role": "admin",
      "isApproved": false,
      "approvedAt": null,
      "created_at": "2025-02-09T10:30:00Z"
    },
    {
      "_id": "user_id_2",
      "email": "admin2@example.com",
      "name": "Admin Two",
      "role": "admin",
      "isApproved": false,
      "approvedAt": null,
      "created_at": "2025-02-09T10:35:00Z"
    }
  ]
}
```

### Approve an Admin Account
**Endpoint**: `PATCH /api/auth/admin/:adminId/approve`
**Headers**: `Authorization: Bearer <your_token>`

```bash
curl -X PATCH http://localhost:5000/api/auth/admin/user_id_1/approve \
  -H "Authorization: Bearer your_jwt_token"
```

**Response**:
```json
{
  "message": "Admin account approved successfully",
  "user": {
    "_id": "user_id_1",
    "email": "admin1@example.com",
    "name": "Admin One",
    "role": "admin",
    "isApproved": true,
    "approvedAt": "2025-02-09T11:00:00Z"
  }
}
```

The approved admin can now log in.

### Reject an Admin Account
**Endpoint**: `PATCH /api/auth/admin/:adminId/reject`
**Headers**: `Authorization: Bearer <your_token>`

```bash
curl -X PATCH http://localhost:5000/api/auth/admin/user_id_2/reject \
  -H "Authorization: Bearer your_jwt_token"
```

**Response**:
```json
{
  "message": "Admin account rejected and deleted",
  "userId": "user_id_2"
}
```

The account is permanently deleted.

### View All Approved Admins
**Endpoint**: `GET /api/auth/admin/approved-admins`
**Headers**: `Authorization: Bearer <your_token>`

```bash
curl -X GET http://localhost:5000/api/auth/admin/approved-admins \
  -H "Authorization: Bearer your_jwt_token"
```

### View All Users
**Endpoint**: `GET /api/auth/admin/users?role=admin` or `?role=user` or no filter
**Headers**: `Authorization: Bearer <your_token>`

```bash
# All users
curl -X GET http://localhost:5000/api/auth/admin/users \
  -H "Authorization: Bearer your_jwt_token"

# Only admins
curl -X GET http://localhost:5000/api/auth/admin/users?role=admin \
  -H "Authorization: Bearer your_jwt_token"

# Only regular users
curl -X GET http://localhost:5000/api/auth/admin/users?role=user \
  -H "Authorization: Bearer your_jwt_token"
```

### Remove Admin Privileges
**Endpoint**: `PATCH /api/auth/admin/:adminId/remove`
**Headers**: `Authorization: Bearer <your_token>`

```bash
curl -X PATCH http://localhost:5000/api/auth/admin/user_id_1/remove \
  -H "Authorization: Bearer your_jwt_token"
```

**Response**:
```json
{
  "message": "Admin privileges removed",
  "user": {
    "_id": "user_id_1",
    "email": "admin1@example.com",
    "name": "Admin One",
    "role": "user"
  }
}
```

This converts the user to a regular user role.

---

## Important Notes

### When Someone Tries to Register as Admin
They will get this response:
```json
{
  "message": "Registration successful. Your admin account is pending approval.",
  "pendingApproval": true,
  "_id": "user_id",
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "admin"
}
```

**No token is provided.** They must wait for approval.

### When an Unapproved Admin Tries to Log In
They will get this response with **403 status**:
```json
{
  "message": "Admin access pending approval. Please contact the administrator.",
  "pendingApproval": true,
  "role": "admin"
}
```

### When a Regular User Tries to Access Admin Routes
They will get:
```json
{
  "message": "Access denied. Admin only."
}
```

### When an Unapproved Admin Tries to Access Admin Routes
They will get:
```json
{
  "message": "Access denied. Admin only."
}
```

Because the `adminMiddleware` checks both the role AND the `isApproved` status.

---

## Frontend Indicators

The frontend now provides better feedback:

### For Users
- Clear distinction between admin and user roles
- Cannot see admin features if not approved
- Error messages explain why access is denied

### For Admins Reviewing Approvals
The frontend context includes:
- `isAdmin`: True if user's role is admin
- `isAdminApproved`: True only if role is admin AND isApproved is true
- `loginError`: Displays approval/auth error messages

---

## Database Fields Reference

Each user document now has:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `role` | String | 'user' | Either 'admin' or 'user' |
| `isApproved` | Boolean | false | Whether admin/user is approved |
| `approvedAt` | Date | null | When they were approved |
| `approvedBy` | ObjectId | null | Which admin approved them |

---

## JWT Token Content

Tokens now include:
```json
{
  "userId": "user_id_here",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

This allows role-based authorization without extra database lookups.
