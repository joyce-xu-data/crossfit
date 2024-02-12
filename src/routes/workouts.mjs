import express from 'express';
import { db } from '../server.mjs';

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories');
    res.json(categories.rows);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpoint for getting sub-categories based on a categoryß
router.get('/categories/:categoryId/subcategories', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const subcategories = await db.query('SELECT * FROM sub_categories WHERE category_id = $1', [categoryId]);
    res.json(subcategories.rows);
  } catch (error) {
    console.error("Failed to fetch subcategories", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint for getting exercises based on a sub-category
router.get('/subcategories/:subCategoryId/workouts', async (req, res) => {
  const { subCategoryId } = req.params;
  const workouts = await db.query('SELECT * FROM workouts WHERE sub_category_id = $1', [subCategoryId]);
  res.json(workouts.rows);
});

// Endpoint for getting workouts based on a category
router.get('/categories/:categoryId/workouts', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const workouts = await db.query('SELECT * FROM workouts WHERE category_id = $1 AND sub_category_id IS NULL', [categoryId]);
    res.json(workouts.rows);
  } catch (error) {
    console.error("Failed to fetch workouts for category", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/api/logs', async (req, res) => {
  const logData = req.body;
  await db.createLog(logData);
  res.status(201).json({ message: 'Log created successfully' });
});

export default router;
