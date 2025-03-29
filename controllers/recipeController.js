
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






const saveRecipe = async (req, res) => {
  try {
    const { recipe } = req.body;  
    if (!recipe) {
      return res.status(400).json({ error: "Recipe data is required" });
    }

    const { title, ingredients, instructions, cuisine, preferences } = recipe;  
    const userId=req.user.id;

    if (!userId || !preferences?.servings || !preferences?.cookingTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRecipe = new Recipe({
      title,
      ingredients,
      instructions,
      cuisine,
      preferences,
      userId
    });

    await newRecipe.save();
    res.status(201).json({ message: "Recipe saved successfully", recipe: newRecipe });

  } catch (err) {
    console.error("Error saving recipe:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { saveRecipe, getRecipe };
