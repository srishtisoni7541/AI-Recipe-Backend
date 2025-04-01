
const generateRecipe = require("../services/geminiServices");
const Recipe = require("../models/Recipe.model");
const redisClient = require("../config/redisClient");
const User = require("../models/User.model");


const getRecipe = async (req, res,next) => {
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
    // console.log(" Calling Gemini API...");
    const recipe = await generateRecipe(ingredients, preferences, cuisine);

    // console.log("Recipe Generated:", recipe);


    res.status(200).json(recipe);
  } catch (err) {
    // console.error(" Error fetching recipe:", err);
    // res.status(500).json({ error: "Internal server error" });


    next(err);
  }
};


const saveRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const userId = req.user?.id;

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

    //  Redis me Save Karna
    const recipeKey = `user:${userId}:recipe:${newRecipe._id}`;
    await redisClient.set(recipeKey, JSON.stringify(newRecipe));
    await redisClient.expire(recipeKey, 3600); // 1 hour expiration

    res.status(201).json({
      message: "Recipe saved successfully",
      recipe: newRecipe,
    });
  } catch (err) {
    next(err);
  }
};



const getAllRecipes = async (req, res,next) => {
  try {
 
    const cachedRecipes = await redisClient.get("allRecipes");

    if (cachedRecipes) {
      // console.log("Serving from Redis Cache");
      return res.status(200).json({ success: true, data: JSON.parse(cachedRecipes) });
    }

    const recipes = await Recipe.find();
    await redisClient.set('recipes', JSON.stringify(recipes), 'EX', 3600);

    // console.log("Serving from MongoDB");
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    next(error);
  
  }
};
const getRecipeById = async (req, res ,next) => {
  const recipeId = req.params.id;
  const cacheKey = `recipe:${recipeId}`; // Unique key banane ke liye

  try {

    const cachedRecipe = await redisClient.get(cacheKey);
    if (cachedRecipe) {
      return res.json({ success: true, data: JSON.parse(cachedRecipe) });
    }


    const recipe = await Recipe.findById(recipeId);
    // console.log(recipe);

    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    //  3. Recipe ko Redis me store karo (1 hour ke liye)
    await redisClient.set(cacheKey, JSON.stringify(recipe), "EX", 3600); // 3600 sec = 1 hour

    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};


 const deleteRecipe = async (req, res,next) => {
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
   next(error);
  }
};




// Function to search recipes by title
const searchRecipesByTitle = async (req, res, next) => {
  try {
    const { title } = req.query;  // Get title from query params
    if (!title) {
      return res.status(400).json({ message: "Title is required for search" });
    }

    // Search recipes by title (case insensitive)
    const recipes = await Recipe.find({
      title: { $regex: title, $options: "i" }  // 'i' for case insensitive search
    });

    if (recipes.length === 0) {
      return res.status(404).json({ message: "No recipes found with that title" });
    }

    return res.status(200).json({ data: recipes });
  } catch (error) {
    next(error)
  }
};




const likedRecipes = async (req, res,next) => {
  const { id: recipeId } = req.params;  
  const userId = req.user.id; 

  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required" });
  }

  try {
    // Check Redis cache for the user's liked recipes
    const cacheKey = `user:${userId}:likedRecipes`;
    const cacheData = await redisClient.get(cacheKey);

    let userLikedRecipes = cacheData ? JSON.parse(cacheData) : [];

    // Fetch user and recipe from the database
    const user = await User.findById(userId);
    const recipe = await Recipe.findById(recipeId);

    if (!user || !recipe) {
      return res.status(404).json({ error: "User or Recipe not found" });
    }

    // Check if the recipe is already liked
    if (userLikedRecipes.includes(recipeId)) {
      return res.status(200).json({ message: "Recipe already liked" });
    }

    // Add the recipe to the user's likedRecipes list
    userLikedRecipes.push(recipeId);

    // Update the user's likedRecipes in the user model
    user.likedRecipes = userLikedRecipes;
    await user.save();

    // Update the likedBy field in the recipe document
    recipe.likedBy.push(userId);
    await recipe.save();

    // Update the Redis cache with the updated likedRecipes list
    await redisClient.set(cacheKey, JSON.stringify(userLikedRecipes), 'EX', 3600); // Cache for 1 hour

    // Delete the user's profile cache to ensure it's reloaded fresh
    const userCacheKey = `user:${userId}`;
    await redisClient.del(userCacheKey); // This is now asynchronous as well

    return res.status(200).json({ message: "Recipe liked successfully" });

  } catch (err) {
    next(err);
  }
};

module.exports = { saveRecipe, getRecipe,getAllRecipes,getRecipeById,deleteRecipe,searchRecipesByTitle, likedRecipes };