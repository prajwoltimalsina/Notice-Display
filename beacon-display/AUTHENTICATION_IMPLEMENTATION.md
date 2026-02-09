# Role-Based Login System with Approval-Based Admin Access - Implementation Summary

## Overview
This document outlines the implementation of a proper role-based login system with approval-based access for admin accounts, resolving the issue where users were logged in as both admin and regular user simultaneously without clear role distinction.

## Changes Made

### 1. **User Model Enhancement** (`backend/models/User.js`)
Added three new fields to track admin approval status:
- `isApproved` (Boolean): Indicates if an admin account has been approved (default: false)
- `approvedAt` (Date): Timestamp when admin was approved
- `approvedBy` (ObjectId): Reference to the admin who approved the account

**Key Behavior:**
- Regular users are auto-approved upon registration
- Admin users require explicit approval before they can log in
- First user in the system is automatically assigned admin role

### 2. **Authentication Controller Updates** (`backend/controllers/authController.js`)

#### Modified `generateToken()` Function
- Now includes `role` in the JWT payload for role-based token verification
- Signature: `generateToken(userId, role)`

#### Enhanced `register()` Function
- Validates role parameter (accepts 'admin' or 'user')
- First user becomes admin automatically
- Admin registrations are NOT auto-approved
- Returns response with `pendingApproval: true` for unapproved admin accounts
- Regular users get immediate token and access

#### Enhanced `login()` Function
- Checks `isApproved` status before granting login
- Blocks unapproved admins with 403 status and clear message
- Returns `pendingApproval: true` for blocked admin accounts
- Returns `isApproved` status in response

#### Updated `getProfile()` Function
- Now includes `isApproved` field in response

### 3. **New Admin Management Controller** (`backend/controllers/adminController.js`)
Created comprehensive admin management endpoints:

#### `getPendingApprovals()`
- Retrieves all pending admin account requests
- Returns count and list of unapproved admins
- Admin-only endpoint

#### `getApprovedAdmins()`
- Retrieves all approved admin accounts
- Useful for auditing and management
- Admin-only endpoint

#### `approveAdmin(adminId)`
- Approves a pending admin account
- Sets `isApproved`, `approvedAt`, and `approvedBy` fields
- Only callable by approved admins
- Prevents re-approval of already approved accounts

#### `rejectAdmin(adminId)`
- Rejects and deletes a pending admin account
- Only works on unapproved accounts
- Prevents rejection of already approved admins
- Admin-only operation

#### `getAllUsers(query)`
- Retrieves all users with optional role filtering
- Supports query: `?role=admin` or `?role=user`
- Returns sorted list by creation date
- Admin-only endpoint

#### `removeAdmin(adminId)`
- Removes admin privileges from a user
- Converts user to regular user role
- Prevents self-demotion
- Admin-only operation

### 4. **Authentication Routes Enhancement** (`backend/routes/authRoutes.js`)
Added new admin management routes (all protected with `authMiddleware` and `adminMiddleware`):

```
GET    /api/auth/admin/pending-approvals  - Get pending admin approvals
GET    /api/auth/admin/approved-admins    - Get approved admins
GET    /api/auth/admin/users              - Get all users (with optional ?role filter)
PATCH  /api/auth/admin/:adminId/approve   - Approve an admin account
PATCH  /api/auth/admin/:adminId/reject    - Reject an admin account
PATCH  /api/auth/admin/:adminId/remove    - Remove admin privileges
```

### 5. **Notice Routes Security** (`backend/routes/noticeRoutes.js`)
- Enhanced all admin-protected routes to use BOTH `authMiddleware` and `adminMiddleware`
- Ensures only authenticated AND admin-approved users can:
  - Get all notices
  - Upload/create notices
  - Update notices
  - Toggle publish status
  - Delete notices
- Public route `/api/notices/published` remains accessible without auth

### 6. **Frontend Authentication Context** (`src/hooks/useMongoAuth.tsx`)

#### Enhanced Context Interface
Added new properties:
- `isAdminApproved`: Specifically checks if user is admin AND approved
- `loginError`: Stores and displays approval/login error messages
- Updated return type for `signIn()` and `signUp()` to include `pendingApproval` flag

#### Updated `signIn()` Function
- Handles pending approval responses
- Sets error message for blocked admin accounts
- Returns `pendingApproval: true` when approval is pending

#### Updated `signUp()` Function
- Accepts optional `role` parameter ('admin' or 'user')
- Handles pending approval for admin registrations
- Sets appropriate error/status messages

#### Enhanced State Management
- Tracks `loginError` for user feedback
- Clears errors on successful authentication
- Maintains approval status in user object

## Security Implications

### What's Protected
1. **Admin Login Barrier**: Unapproved admins cannot log in
2. **Token Verification**: JWT tokens now include role information
3. **Double Authorization**: Admin routes require both auth token AND admin role
4. **Admin Operations**: Only approved admins can:
   - Manage notices
   - Approve/reject new admins
   - Remove admin privileges
   - View admin user lists

### Clear Role Distinction
- **Admin Role**: `role === 'admin'` AND `isApproved === true`
- **Regular User**: `role === 'user'` AND `isApproved === true`
- **Pending Admin**: `role === 'admin'` AND `isApproved === false` (cannot access system)

## User Workflows

### Regular User Registration
1. User signs up with role 'user' (or default)
2. Account created with `isApproved: true`
3. Token generated immediately
4. User can log in and access user-level features

### Admin Registration
1. Admin candidate signs up with role 'admin'
2. Account created with `isApproved: false`
3. NO token generated
4. Returns message: "Registration successful. Your admin account is pending approval."
5. User must wait for approval before accessing admin features

### Admin Approval Process
1. Approved admin calls `/api/auth/admin/pending-approvals`
2. Reviews pending admin accounts
3. Calls `/api/auth/admin/:adminId/approve`
4. Newly approved admin can now log in
5. Newly approved admin gets full admin access

### First User Setup
1. First registered user automatically becomes admin
2. First admin is automatically approved
3. Can then approve additional admin accounts

## Database Migration
No migration needed as the new fields have defaults:
- `isApproved: false` - new admins won't be approved
- `approvedAt: null` - no approval timestamp until approved
- `approvedBy: null` - no reference until approved

Existing users will have these fields set to defaults.

## Testing Checklist

### Regular User Flow
- [ ] Register as regular user
- [ ] Receive token immediately
- [ ] Log in successfully
- [ ] Access user features
- [ ] Cannot access admin features

### Admin Approval Flow
- [ ] Register as admin (second user)
- [ ] Receive no token (pending approval message)
- [ ] Cannot log in (403 with pending approval message)
- [ ] Approved admin approves the account
- [ ] User can now log in
- [ ] User has admin access

### Admin Management
- [ ] View pending approvals
- [ ] View approved admins
- [ ] View all users with filters
- [ ] Approve pending admin
- [ ] Reject pending admin
- [ ] Remove admin privileges

### Security
- [ ] Unapproved admin cannot access admin routes
- [ ] Regular user cannot access admin routes
- [ ] Admin middleware properly blocks unauthorized access
- [ ] JWT token includes role information

## Future Enhancements
1. Email notifications when admin approvals are pending
2. Admin approval request with custom messages
3. Audit logs for all approval/rejection actions
4. Role-based dashboard showing approval status
5. Two-factor authentication for admin accounts
6. Admin activity logging and monitoring
