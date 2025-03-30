


const generateRecipe = require("../services/geminiServices");
const Recipe = require("../models/Recipe.model");
const redisClient = require("../config/redisClient");


const getRecipe = async (req, res) => {
  console.log('hello');
  try {
    const { ingredients, preferences, cuisine } = req.body;
    console.log("🔹 Request Received:", { ingredients, preferences, cuisine });

    // ✅ Input Validation
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      console.error(" Invalid Ingredients:", ingredients);
      return res.status(400).json({ error: "Ingredients must be a non-empty array" });
    }
    if (!cuisine || typeof cuisine !== "string") {
      console.error(" Invalid Cuisine:", cuisine);
      return res.status(400).json({ error: "Cuisine must be a valid string" });
    }

    const cacheKey = `recipe:${JSON.stringify(ingredients)}:${JSON.stringify(preferences)}:${cuisine}`;
    
    // ✅ Redis Cache Check
    const cachedRecipe = await redisClient.get(cacheKey);
    if (cachedRecipe) {
      console.log("✅ Cache Hit! Returning Cached Recipe.");
      return res.status(200).json(JSON.parse(cachedRecipe));
    }

    // ✅ Recipe Generate Karna
    console.log("🚀 Calling Gemini API...");
    const recipe = await generateRecipe(ingredients, preferences, cuisine);

    console.log("✅ Recipe Generated:", recipe);

    // ✅ Redis Me Cache Karna (1 Hour ke liye)
    await redisClient.set(cacheKey, JSON.stringify(recipe), "EX", 3600);

    res.status(200).json(recipe);
  } catch (err) {
    console.error("❌ Error fetching recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const saveRecipe = async (req, res) => {
  try {
    console.log("🔵 Request Body:", req.body);  
    const { recipe } = req.body;
    if (!recipe) {
      return res.status(400).json({ error: "Recipe data is required" });
    }

    const { title, ingredients, instructions } = recipe;
    const userId = req.user?.id; 

    if (!userId) {
      return res.status(400).json({ error: "User ID missing" });
    }

    const newRecipe = new Recipe({
      title,
      ingredients,
      instructions,
      userId
    });

    await newRecipe.save();
    console.log("✅ Recipe saved:", newRecipe);  // Debugging ke liye
    res.status(201).json({ message: "Recipe saved successfully", recipe: newRecipe });

  } catch (err) {
    console.error("❌ Error saving recipe:", err); // 🔴 Exact error yaha dikhega
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};





// const saveRecipe = async (req, res) => {
//   try {
//     const { recipe } = req.body;  
//     if (!recipe) {
//       return res.status(400).json({ error: "Recipe data is required" });
//     }

//     const { title, ingredients, instructions } = recipe;  
//     const userId=req.user.id;

//     if (!userId ) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const newRecipe = new Recipe({
//       title,
//       ingredients,
//       instructions,
//       userId
//     });

//     await newRecipe.save();
//     res.status(201).json({ message: "Recipe saved successfully", recipe: newRecipe });

//   } catch (err) {
//     console.error("Error saving recipe:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const getAllRecipes = async (req, res) => {
  try {
 
    const cachedRecipes = await redisClient.get("allRecipes");

    if (cachedRecipes) {
      console.log("Serving from Redis Cache");
      return res.status(200).json({ success: true, data: JSON.parse(cachedRecipes) });
    }

    const recipes = await Recipe.find();
    await redisClient.setEx("allRecipes", 3600, JSON.stringify(recipes));

    console.log("Serving from MongoDB");
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { saveRecipe, getRecipe,getAllRecipes };