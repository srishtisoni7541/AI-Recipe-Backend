// const generateRecipe = require('../services/geminiServices');
// const Recipe =require('../models/Recipe.model');
// const redisClient = require('../config/redisClient');

//  const getRecipe = async (req, res) => {
//   const { ingredients, preferences, cuisine } = req.body;
//   const cacheKey = `recipe:${ingredients}:${preferences}:${cuisine}`;

//   const cachedRecipe = await redisClient.get(cacheKey);
//   if (cachedRecipe) return res.json(JSON.parse(cachedRecipe));

//   const recipe = await generateRecipe(ingredients, preferences, cuisine);
//   await redisClient.set(cacheKey, JSON.stringify(recipe), "EX", 3600);

//   res.json(recipe);
// };

//  const saveRecipe = async (req, res) => {
//   const recipe = await Recipe.create({ ...req.body, userId: req.user.id });
//   res.status(201).json(recipe);
// };

// module.exports = {saveRecipe,getRecipe};





const generateRecipe = require("../services/geminiServices");
const Recipe = require("../models/Recipe.model");
const redisClient = require("../config/redisClient");

// ✅ Recipe Fetch Karne Ka Function (Caching + Validation)
const getRecipe = async (req, res) => {
  try {
    const { ingredients, preferences, cuisine } = req.body;

    // ✅ Input Validation
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredients must be a non-empty array" });
    }
    if (!cuisine || typeof cuisine !== "string") {
      return res.status(400).json({ error: "Cuisine must be a valid string" });
    }

    const cacheKey = `recipe:${JSON.stringify(ingredients)}:${JSON.stringify(preferences)}:${cuisine}`;

    // ✅ Redis Cache Check
    const cachedRecipe = await redisClient.get(cacheKey);
    if (cachedRecipe) {
      return res.status(200).json(JSON.parse(cachedRecipe));
    }

    // ✅ Recipe Generate Karna
    const recipe = await generateRecipe(ingredients, preferences, cuisine);

    // ✅ Redis Me Cache Karna (1 Hour ke liye)
    await redisClient.set(cacheKey, JSON.stringify(recipe), "EX", 3600);

    res.status(200).json(recipe);
  } catch (err) {
    console.error("Error fetching recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Recipe Save Karne Ka Function (Authentication + Validation)
const saveRecipe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // ✅ Validate Request Body
    const { title, ingredients, cuisine, preferences } = req.body;
    if (!title || !ingredients || !cuisine) {
      return res.status(400).json({ error: "Title, ingredients, and cuisine are required" });
    }

    // ✅ Recipe Save Karna
    const recipe = await Recipe.create({ ...req.body, userId: req.user.id });

    res.status(201).json({ message: "Recipe saved successfully", recipe });
  } catch (err) {
    console.error("Error saving recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { saveRecipe, getRecipe };
