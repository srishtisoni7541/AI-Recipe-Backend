const express = require('express');
const { getRecipe, saveRecipe, getAllRecipes, getRecipeById, deleteRecipe, likeRecipe } = require('../controllers/recipeController');

const isLoggedIn = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/generate", getRecipe);
router.post("/save", isLoggedIn, saveRecipe);
router.get("/getAllRecipes",isLoggedIn, getAllRecipes);
router.get("/getRecipeById/:id", isLoggedIn,getRecipeById);
router.delete("/deleteRecipe/:id", isLoggedIn, deleteRecipe);
router.post("/likeRecipe",isLoggedIn, likeRecipe);

module.exports = router;
