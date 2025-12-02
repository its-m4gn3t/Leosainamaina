const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getGalleryPhotos,
  uploadPhoto,
  updatePhoto,
  deletePhoto
} = require('../controllers/galleryController');

router.route('/')
  .get(getGalleryPhotos)
  .post(protect, uploadPhoto);

router.route('/:id')
  .put(protect, updatePhoto)
  .delete(protect, deletePhoto);

module.exports = router;