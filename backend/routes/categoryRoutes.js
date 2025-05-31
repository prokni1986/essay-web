// file: routes/categoryRoutes.js
import express from 'express';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js'; // Needed to check if category has topics

const router = express.Router();

// 1. Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name cannot be empty." });
    }
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(409).json({ error: `Category "${name.trim()}" already exists.` });
    }
    const newCategory = new Category({ name: name.trim(), description });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error while creating category." });
  }
});

// 2. Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Sort by name
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching categories." });
  }
});

// 3. Get a single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching category." });
  }
});

// 4. Update a category
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name cannot be empty." });
    }

    const categoryToUpdate = await Category.findById(req.params.id);
    if (!categoryToUpdate) {
      return res.status(404).json({ error: "Category not found to update." });
    }

    // Check if new name conflicts with an existing category (excluding itself)
    const existingCategoryWithSameName = await Category.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
    if (existingCategoryWithSameName) {
      return res.status(409).json({ error: `Another category with the name "${name.trim()}" already exists.` });
    }

    categoryToUpdate.name = name.trim();
    categoryToUpdate.description = description !== undefined ? description.trim() : categoryToUpdate.description;

    await categoryToUpdate.save();
    res.json(categoryToUpdate);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error while updating category." });
  }
});

// 5. Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryToDelete = await Category.findById(categoryId);
    if (!categoryToDelete) {
      return res.status(404).json({ error: "Category not found to delete." });
    }

    // Check if any topics are associated with this category
    const topicsInCategory = await Topic.find({ category: categoryId });
    if (topicsInCategory.length > 0) {
      return res.status(400).json({
        error: `Cannot delete category "${categoryToDelete.name}". It contains ${topicsInCategory.length} topic(s). Please reassign or delete them first.`,
        hasTopics: true, // You can use this flag on the frontend
      });
    }

    await Category.findByIdAndDelete(categoryId);
    res.json({ message: `Category "${categoryToDelete.name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: "Server error while deleting category." });
  }
});

export default router;