# Role-Based Authentication API - Complete Reference & Examples

## Authentication Endpoints

### 1. Register User/Admin
**POST** `/api/auth/register`

#### Request
```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "name": "Administrator",
  "role": "admin"  // Optional: 'admin' or 'user' (default: 'user')
}
```

#### Response - Admin Registration (Pending Approval)
Status: 201
```json
{
  "message": "Registration successful. Your admin account is pending approval.",
  "pendingApproval": true,
  "_id": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "name": "Administrator",
  "role": "admin"
}
```

#### Response - Regular User Registration
Status: 201
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "_id": "507f1f77bcf86cd799439012",
  "email": "user@example.com",
  "name": "Regular User",
  "role": "user",
  "isApproved": true
}
```

---

### 2. Login
**POST** `/api/auth/login`

#### Request
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

#### Response - Approved User
Status: 200
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "_id": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "name": "Administrator",
  "role": "admin",
  "isApproved": true
}
```

#### Response - Pending Approval (Blocked)
Status: 403
```json
{
  "message": "Admin access pending approval. Please contact the administrator.",
  "pendingApproval": true,
  "role": "admin"
}
```

#### Response - Invalid Credentials
Status: 401
```json
{
  "message": "Invalid email or password"
}
```

---

### 3. Get User Profile
**GET** `/api/auth/profile`

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response
Status: 200
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "name": "Administrator",
  "role": "admin",
  "isApproved": true
}
```

---

## Admin Management Endpoints

### 4. Get Pending Admin Approvals
**GET** `/api/auth/admin/pending-approvals`

#### Headers
```
Authorization: Bearer <admin_token>
```

#### Response
Status: 200
```json
{
  "message": "Pending admin approvals retrieved",
  "count": 2,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "email": "newadmin1@example.com",
      "name": "New Admin One",
      "role": "admin",
      "isApproved": false,
      "created_at": "2025-02-09T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "email": "newadmin2@example.com",
      "name": "New Admin Two",
      "role": "admin",
      "isApproved": false,
      "created_at": "2025-02-09T10:35:00Z"
    }
  ]
}
```

#### Errors
Status: 401 - No token
```json
{
  "message": "No token provided, authorization denied"
}
```

Status: 403 - Not an admin
```json
{
  "message": "Access denied. Admin only."
}
```

---

### 5. Get Approved Admins
**GET** `/api/auth/admin/approved-admins`

#### Headers
```
Authorization: Bearer <admin_token>
```

#### Response
Status: 200
```json
{
  "message": "Approved admins retrieved",
  "count": 1,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "name": "Administrator",
      "role": "admin",
      "isApproved": true,
      "approvedAt": "2025-02-09T09:00:00Z"
    }
  ]
}
```

---

### 6. Get All Users (Filterable)
**GET** `/api/auth/admin/users?role=admin`

#### Query Parameters
- `role` (optional): 'admin' or 'user' - Filter users by role

#### Headers
```
Authorization: Bearer <admin_token>
```

#### Response - All Users
```
GET /api/auth/admin/users
```

Status: 200
```json
{
  "message": "Users retrieved",
  "count": 4,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "name": "Administrator",
      "role": "admin",
      "isApproved": true,
      "created_at": "2025-02-09T08:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "email": "user1@example.com",
      "name": "User One",
      "role": "user",
      "isApproved": true,
      "created_at": "2025-02-09T09:00:00Z"
    }
  ]
}
```

#### Response - Only Admins
```
GET /api/auth/admin/users?role=admin
```

Status: 200
```json
{
  "message": "Users retrieved",
  "count": 2,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "name": "Administrator",
      "role": "admin",
      "isApproved": true
    }
  ]
}
```

---

### 7. Approve Admin Account
**PATCH** `/api/auth/admin/:adminId/approve`

#### URL Parameters
- `adminId`: MongoDB ObjectId of the admin to approve

#### Headers
```
Authorization: Bearer <admin_token>
```

#### Response - Success
Status: 200
```json
{
  "message": "Admin account approved successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "email": "newadmin@example.com",
    "name": "New Admin",
    "role": "admin",
    "isApproved": true,
    "approvedAt": "2025-02-09T11:30:00Z"
  }
}
```

#### Response - Already Approved
Status: 400
```json
{
  "message": "User is already approved"
}
```

#### Response - Not an Admin
Status: 400
```json
{
  "message": "User is not an admin"
}
```

---

### 8. Reject Admin Account
**PATCH** `/api/auth/admin/:adminId/reject`

#### URL Parameters
- `adminId`: MongoDB ObjectId of the admin to reject

#### Headers
```
Authorization: Bearer <admin_token>
```

#### Request Body
(Empty or no body required)

#### Response - Success (Account Deleted)
Status: 200
```json
{
  "message": "Admin account rejected and deleted",
  "userId": "507f1f77bcf86cd799439013"
}
```

#### Response - Already Approved (Cannot Reject)
Status: 400
```json
{
  "message": "User is already approved. Cannot reject."
}
```

---

### 9. Remove Admin Privileges
**PATCH** `/api/auth/admin/:adminId/remove`

#### URL Parameters
- `adminId`: MongoDB ObjectId of the admin to demote

#### Headers
```
Authorization: Bearer <admin_token>
```

#### Response - Success (Convert to User)
Status: 200
```json
{
  "message": "Admin privileges removed",
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "email": "former-admin@example.com",
    "name": "Former Admin",
    "role": "user"
  }
}
```

#### Response - Trying to Remove Self
Status: 400
```json
{
  "message": "You cannot remove your own admin privileges"
}
```

#### Response - Not an Admin
Status: 400
```json
{
  "message": "User is not an admin"
}
```

---

## Protected Routes (Require Admin)

These routes require BOTH authentication AND admin approval:

### Create Notice (Upload)
**POST** `/api/notices/upload`

Status: 403 if not approved admin:
```json
{
  "message": "Access denied. Admin only."
}
```

### Get All Notices
**GET** `/api/notices`

### Update Notice
**PUT** `/api/notices/:noticeId`

### Toggle Notice Publish Status
**PATCH** `/api/notices/:noticeId/toggle`

### Delete Notice
**DELETE** `/api/notices/:noticeId`

---

## Public Routes (No Auth Required)

### Get Published Notices
**GET** `/api/notices/published`

Status: 200
```json
{
  "updatedAt": 1707476400000,
  "notices": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "New Schedule",
      "description": "Updated class schedule",
      "fileUrl": "https://...",
      "is_published": true,
      "status": "published",
      "created_at": "2025-02-09T10:00:00Z"
    }
  ]
}
```

---

## Error Status Codes Reference

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request format and parameters |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | Access denied (not admin or not approved) |
| 404 | Not Found | User/resource not found |
| 500 | Server Error | Server-side issue |

---

## Testing Scenarios

### Scenario 1: First User Setup
```bash
# Register first user (becomes admin automatically)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User",
    "role": "admin"
  }'

# Response: Receives token (first admin is auto-approved)
# Can immediately log in and manage system
```

### Scenario 2: Request Admin Access
```bash
# Second user tries to register as admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com",
    "password": "password123",
    "name": "New Admin",
    "role": "admin"
  }'

# Response: No token, pendingApproval: true
# User cannot log in yet
```

### Scenario 3: Approve Pending Admin
```bash
# First admin checks pending approvals
curl -X GET http://localhost:5000/api/auth/admin/pending-approvals \
  -H "Authorization: Bearer <first_admin_token>"

# Gets list of pending admins with their IDs
# Then approves the pending admin
curl -X PATCH http://localhost:5000/api/auth/admin/507f1f77bcf86cd799439013/approve \
  -H "Authorization: Bearer <first_admin_token>"

# Now the new admin can log in
```

### Scenario 4: Regular User Blocked from Admin
```bash
# Regular user tries to access admin endpoint
curl -X POST http://localhost:5000/api/notices/upload \
  -H "Authorization: Bearer <user_token>" \
  -F "file=@notice.pdf"

# Response: 403 - Access denied. Admin only.
```

### Scenario 5: Unapproved Admin Blocked
```bash
# Unapproved admin tries to log in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com",
    "password": "password123"
  }'

# Response: 403 with message about pending approval
# No token provided
```
