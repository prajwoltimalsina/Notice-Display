const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/profile (protected)
router.get('/profile', authMiddleware, authController.getProfile);

// Admin management routes (protected, admin only)
// GET /api/auth/pending-approvals - Get all pending admin approvals
router.get('/admin/pending-approvals', authMiddleware, adminMiddleware, adminController.getPendingApprovals);

// GET /api/auth/approved-admins - Get all approved admins
router.get('/admin/approved-admins', authMiddleware, adminMiddleware, adminController.getApprovedAdmins);

// GET /api/auth/users - Get all users with optional role filter
router.get('/admin/users', authMiddleware, adminMiddleware, adminController.getAllUsers);

// PATCH /api/auth/admin/:adminId/approve - Approve admin account
router.patch('/admin/:adminId/approve', authMiddleware, adminMiddleware, adminController.approveAdmin);

// PATCH /api/auth/admin/:adminId/reject - Reject admin account
router.patch('/admin/:adminId/reject', authMiddleware, adminMiddleware, adminController.rejectAdmin);

// PATCH /api/auth/admin/:adminId/remove - Remove admin privileges
router.patch('/admin/:adminId/remove', authMiddleware, adminMiddleware, adminController.removeAdmin);

module.exports = router;
