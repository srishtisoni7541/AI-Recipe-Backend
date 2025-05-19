const generateRecipe = require("../services/geminiServices");
const Recipe = require("../models/Recipe.model");
const redisClient = require("../config/redisClient");
const User = require("../models/User.model");

const getRecipe = async (req, res, next) => {
  try {
    const { ingredients, preferences, cuisine } = req.body;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Ingredients must be a non-empty array" });
    }

    if (!cuisine || typeof cuisine !== "string") {
      return res.status(400).json({ error: "Cuisine must be a valid string" });
    }

    const recipe = await generateRecipe(ingredients, preferences, cuisine);
    res.status(200).json(recipe);
  } catch (err) {
    next(err);
  }
};

const saveRecipe = async (req, res, next) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID missing" });
    }

    const newRecipe = new Recipe({
      title,
      ingredients,
      instructions,
      userId,
    });

    await newRecipe.save();

    const recipeKey = `user:${userId}:recipe:${newRecipe._id}`;
    await redisClient.set(recipeKey, JSON.stringify(newRecipe), { ex: 3600 });

    res.status(201).json({
      message: "Recipe saved successfully",
      recipe: newRecipe,
    });
  } catch (err) {
    next(err);
  }
};

const getAllRecipes = async (req, res, next) => {
  try {
    const cachedRecipes = await redisClient.get("allRecipes");

    if (cachedRecipes) {
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cachedRecipes) });
    }

    const recipes = await Recipe.find();
    await redisClient.set("allRecipes", JSON.stringify(recipes), { ex: 3600 });

    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    next(error);
  }
};

const getRecipeById = async (req, res, next) => {
  const recipeId = req.params.id;
  const cacheKey = `recipe:${recipeId}`;

  try {
    const cachedRecipe = await redisClient.get(cacheKey);
    if (cachedRecipe) {
      return res.json({ success: true, data: JSON.parse(cachedRecipe) });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    await redisClient.set(cacheKey, JSON.stringify(recipe), { ex: 3600 });
    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    await Recipe.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const searchRecipesByTitle = async (req, res, next) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ message: "Title is required for search" });
    }

    const recipes = await Recipe.find({
      title: { $regex: title, $options: "i" },
    });

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "No recipes found with that title" });
    }

    return res.status(200).json({ data: recipes });
  } catch (error) {
    next(error);
  }
};

const likedRecipes = async (req, res, next) => {
  const { id: recipeId } = req.params;
  const userId = req.user.id;

  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required" });
  }

  try {
    const cacheKey = `user:${userId}:likedRecipes`;
    const cacheData = await redisClient.get(cacheKey);
    let userLikedRecipes = cacheData ? JSON.parse(cacheData) : [];

    const user = await User.findById(userId);
    const recipe = await Recipe.findById(recipeId);

    if (!user || !recipe) {
      return res.status(404).json({ error: "User or Recipe not found" });
    }

    if (userLikedRecipes.includes(recipeId)) {
      return res.status(200).json({ message: "Recipe already liked" });
    }

    userLikedRecipes.push(recipeId);
    user.likedRecipes = userLikedRecipes;
    await user.save();

    recipe.likedBy.push(userId);
    await recipe.save();

    await redisClient.set(cacheKey, JSON.stringify(userLikedRecipes), {
      ex: 3600,
    });

    const userCacheKey = `user:${userId}`;
    await redisClient.del(userCacheKey);

    return res.status(200).json({ message: "Recipe liked successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  saveRecipe,
  getRecipe,
  getAllRecipes,
  getRecipeById,
  deleteRecipe,
  searchRecipesByTitle,
  likedRecipes,
};
