
const generateRecipe = require("../services/geminiServices");
const Recipe = require("../models/Recipe.model");
const redisClient = require("../config/redisClient");


const getRecipe = async (req, res) => {
  try {
    const { ingredients, preferences, cuisine } = req.body;

    //  Input Validation
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      console.error(" Invalid Ingredients:", ingredients);
      return res.status(400).json({ error: "Ingredients must be a non-empty array" });
    }
    if (!cuisine || typeof cuisine !== "string") {
      console.error(" Invalid Cuisine:", cuisine);
      return res.status(400).json({ error: "Cuisine must be a valid string" });
    }

    


    //  Recipe Generate Karna
    console.log(" Calling Gemini API...");
    const recipe = await generateRecipe(ingredients, preferences, cuisine);

    console.log("Recipe Generated:", recipe);


    res.status(200).json(recipe);
  } catch (err) {
    console.error(" Error fetching recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const saveRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const userId = req.user?.id;
    console.log(userId);
    console.log("Request Body:", title, ingredients, instructions);

    if (!userId) {
      return res.status(400).json({ error: "User ID missing" });
    }

    const newRecipe = new Recipe({
      title: title,
      ingredients: ingredients,
      instructions: instructions,
      userId,
    });

    await newRecipe.save();

    // ✅ Redis me Save Karna
    const recipeKey = `user:${userId}:recipe:${newRecipe._id}`;
    await redisClient.set(recipeKey, JSON.stringify(newRecipe));
    await redisClient.expire(recipeKey, 3600); // 1 hour expiration

    res.status(201).json({
      message: "Recipe saved successfully",
      recipe: newRecipe,
    });
  } catch (err) {
    console.error("Error saving recipe:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};



const getAllRecipes = async (req, res) => {
  try {
 
    const cachedRecipes = await redisClient.get("allRecipes");

    if (cachedRecipes) {
      console.log("Serving from Redis Cache");
      return res.status(200).json({ success: true, data: JSON.parse(cachedRecipes) });
    }

    const recipes = await Recipe.find();
    await redisClient.set('recipes', JSON.stringify(recipes), 'EX', 3600);

    console.log("Serving from MongoDB");
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getRecipeById = async (req, res) => {
  const recipeId = req.params.id;
  const cacheKey = `recipe:${recipeId}`; // Unique key banane ke liye

  try {

    const cachedRecipe = await redisClient.get(cacheKey);
    if (cachedRecipe) {
      return res.json({ success: true, data: JSON.parse(cachedRecipe) });
    }


    const recipe = await Recipe.findById(recipeId);
    console.log(recipe);

    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    // ✅ 3. Recipe ko Redis me store karo (1 hour ke liye)
    await redisClient.set(cacheKey, JSON.stringify(recipe), "EX", 3600); // 3600 sec = 1 hour

    res.json({ success: true, data: recipe });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


 const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if recipe exists
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    // Delete the recipe
    await Recipe.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};





const likeRecipe = async (req, res) => {
  const { recipeId, userId } = req.body;

  try {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const isLiked = recipe.likedBy.includes(userId);

    if (isLiked) {
      // If the recipe is already liked, unlike it
      recipe.likedBy = recipe.likedBy.filter((id) => id !== userId);
    } else {
      // Otherwise, like the recipe
      recipe.likedBy.push(userId);
    }

    await recipe.save();
    return res.status(200).json({ success: true, recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating the recipe" });
  }
};
module.exports = { saveRecipe, getRecipe,getAllRecipes,getRecipeById,deleteRecipe,likeRecipe };