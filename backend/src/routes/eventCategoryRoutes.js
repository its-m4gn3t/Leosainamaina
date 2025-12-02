const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getActiveCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/eventCategoryController');

router.get('/', getAllCategories);
router.get('/active', getActiveCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;