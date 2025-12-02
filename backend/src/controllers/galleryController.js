const Gallery = require('../models/galleryModel');

// Get all gallery photos
const getGalleryPhotos = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, isActive: true } : { isActive: true };
    
    const photos = await Gallery.find(filter)
      .populate('eventId', 'title')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload new photo
const uploadPhoto = async (req, res) => {
  try {
    const { title, description, imageUrl, category, eventId } = req.body;
    
    const photo = new Gallery({
      title,
      description,
      imageUrl,
      category,
      eventId: eventId || null,
      uploadedBy: req.user.id
    });
    
    await photo.save();
    await photo.populate('eventId', 'title');
    await photo.populate('uploadedBy', 'name');
    
    res.status(201).json(photo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update photo
const updatePhoto = async (req, res) => {
  try {
    const photo = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('eventId', 'title').populate('uploadedBy', 'name');
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    res.json(photo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete photo
const deletePhoto = async (req, res) => {
  try {
    const photo = await Gallery.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGalleryPhotos,
  uploadPhoto,
  updatePhoto,
  deletePhoto
};