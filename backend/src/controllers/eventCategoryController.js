const EventCategory = require('../models/eventCategoryModel');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await EventCategory.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active categories
const getActiveCategories = async (req, res) => {
  try {
    const categories = await EventCategory.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const category = new EventCategory({ name, description, color });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const category = await EventCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await EventCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getActiveCategories,
  createCategory,
  updateCategory,
  deleteCategory
};