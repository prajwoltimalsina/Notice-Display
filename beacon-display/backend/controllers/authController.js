const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token with role
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Create user
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);
    const userRole = userCount === 0 ? 'admin' : role; // First user is always admin
    const isApproved = userCount === 0 || userRole === 'user'; // First user OR regular users are auto-approved
    const isSuperAdmin = userCount === 0; // Only first user is super admin
    console.log('Creating user with role:', userRole, 'isApproved:', isApproved, 'isSuperAdmin:', isSuperAdmin);

    const user = new User({
      email,
      password,
      name,
      role: userRole,
      isApproved,
      isSuperAdmin,
    });

    await user.save();

    // Only generate token if approved (auto-approved for regular users)
    if (!isApproved) {
      return res.status(201).json({
        message: 'Registration successful. Your admin account is pending approval.',
        pendingApproval: true,
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      });
    }

    // Generate token for approved users
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
      isSuperAdmin: user.isSuperAdmin,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({ 
        message: 'Admin access pending approval. Please contact the administrator.',
        pendingApproval: true,
        role: user.role,
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
      isSuperAdmin: user.isSuperAdmin,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      isApproved: req.user.isApproved,
      isSuperAdmin: req.user.isSuperAdmin,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({ 
        message: 'If an account with that email exists, you will receive a password reset code.' 
      });
    }

    // Generate reset code (6-digit numeric code for easy manual entry)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeHash = require('crypto')
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    // Set reset code and expiry (10 minutes)
    user.resetPasswordToken = resetCodeHash;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await user.save();

    // Log the code for development debugging
    console.log(`\n========== PASSWORD RESET CODE ==========`);
    console.log(`Email: ${email}`);
    console.log(`Reset Code: ${resetCode}`);
    console.log(`Expires in: 10 minutes`);
    console.log(`==========================================\n`);

    // Try to send email with reset code
    try {
      await sendResetCodeEmail(user.email, user.name || 'User', resetCode);
      console.log(`Reset email sent to ${user.email}`);
    } catch (emailError) {
      console.warn(`Failed to send email: ${emailError.message}. Code available in console.`);
      // Don't fail the request if email sending fails in development
      if (process.env.NODE_ENV === 'production') {
        throw emailError;
      }
    }

    // In development, return the code for testing
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    res.status(200).json({ 
      message: 'If an account with that email exists, you will receive a password reset code.',
      resetCode: isDevelopment ? resetCode : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Helper function to send reset code email
async function sendResetCodeEmail(email, name, resetCode) {
  const sgMail = require('@sendgrid/mail');
  
  // Check if SendGrid credentials are configured
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn('\n⚠️  SENDGRID NOT CONFIGURED');
    console.warn('SENDGRID_API_KEY:', apiKey ? '[SET]' : '[NOT SET]');
    console.warn('SENDGRID_FROM_EMAIL:', fromEmail ? '[SET]' : '[NOT SET]');
    console.warn('Please update .env file with actual SendGrid credentials\n');
    throw new Error('SendGrid credentials not configured. Update .env file with SENDGRID_API_KEY and SENDGRID_FROM_EMAIL');
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to: email,
    from: fromEmail,
    subject: 'Password Reset Code - KU Notice Board',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Use the code below to reset your password:</p>
        
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #0066cc; letter-spacing: 5px; font-size: 24px; margin: 0;">
            ${resetCode}
          </h3>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This code expires in 10 minutes</li>
          <li>If you didn't request this, please ignore this email</li>
          <li>Never share this code with anyone</li>
        </ul>
        
        <p>Go to your password reset page and enter this code along with your new password.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from KU Notice Board. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    console.log(`\n📧 Attempting to send reset code email to ${email} via SendGrid...`);
    const result = await sgMail.send(msg);
    console.log(`✅ Reset email sent successfully!`);
    return result;
  } catch (err) {
    console.error('\n❌ EMAIL SENDING FAILED');
    console.error('Error:', err.message);
    if (err.response) {
      console.error(err.response.body);
    }
    console.error('\nCommon causes:');
    console.error('1. Incorrect SENDGRID_API_KEY or SENDGRID_FROM_EMAIL in .env');
    console.error('2. Sender Identity not verified on SendGrid');
    console.error('3. SendGrid account restricted or suspended\n');
    throw err;
  }
}

// Verify password reset token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Hash the token to match with stored hash
    const crypto = require('crypto');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired.' 
      });
    }

    res.status(200).json({ 
      message: 'Token is valid',
      email: user.email,
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the token to match with stored hash
    const crypto = require('crypto');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired. Please request a new one.' 
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ 
      message: 'Password reset successfully. You can now sign in with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};
