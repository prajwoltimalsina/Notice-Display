const Notice = require('../models/Notice');
const { cloudinary } = require('../config/cloudinary');

// Get all notices (admin)
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({ created_at: -1 })
      .populate('created_by', 'name email');
    res.json(notices);
  } catch (error) {
    console.error('Get all notices error:', error);
    res.status(500).json({ message: 'Failed to fetch notices' });
  }
};

// Get published notices only (public display)
exports.getPublishedNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ is_published: true })
      .sort({ created_at: -1 });
    res.json(notices);
  } catch (error) {
    console.error('Get published notices error:', error);
    res.status(500).json({ message: 'Failed to fetch notices' });
  }
};

// Upload and create notice
exports.createNotice = async (req, res, io) => {
  try {
    const { title, description, is_published, status } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const notice = new Notice({
      title,
      description,
      fileUrl: req.file.path,
      file_type: req.file.mimetype,
      cloudinary_id: req.file.filename,
      is_published: is_published === 'true',
      status: status || (is_published === 'true' ? 'published' : 'draft'),
      created_by: req.user._id,
    });

    await notice.save();

    // Emit socket event for real-time update
    if (io) {
      io.emit('notice:created', notice);
    }

    res.status(201).json({
      message: 'Notice created successfully',
      notice,
    });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Failed to create notice' });
  }
};

// Update notice
exports.updateNotice = async (req, res, io) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const notice = await Notice.findByIdAndUpdate(
      id,
      { ...updates, updated_at: new Date() },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Emit socket event
    if (io) {
      io.emit('notice:updated', notice);
    }

    res.json({
      message: 'Notice updated successfully',
      notice,
    });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ message: 'Failed to update notice' });
  }
};

// Toggle publish status
exports.togglePublish = async (req, res, io) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    notice.is_published = !notice.is_published;
    notice.status = notice.is_published ? 'published' : 'draft';
    notice.updated_at = new Date();

    await notice.save();

    // Emit socket event
    if (io) {
      io.emit('notice:toggled', notice);
    }

    res.json({
      message: notice.is_published ? 'Notice published' : 'Notice unpublished',
      notice,
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({ message: 'Failed to toggle notice status' });
  }
};

// Delete notice
exports.deleteNotice = async (req, res, io) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Delete from Cloudinary if exists
    if (notice.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(notice.cloudinary_id);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    await Notice.findByIdAndDelete(id);

    // Emit socket event
    if (io) {
      io.emit('notice:deleted', { _id: id });
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Failed to delete notice' });
  }
};
