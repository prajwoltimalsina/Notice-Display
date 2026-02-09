const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  file_type: {
    type: String,
    required: true,
  },
  cloudinary_id: {
    type: String,
  },
  is_published: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  // Display properties
  position_x: { type: Number, default: 0 },
  position_y: { type: Number, default: 0 },
  width: { type: Number, default: 300 },
  height: { type: Number, default: 200 },
  z_index: { type: Number, default: 1 },
});

// Update timestamp on save
noticeSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Notice', noticeSchema);
