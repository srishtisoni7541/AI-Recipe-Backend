const express = require('express');
const { getRecipe, saveRecipe, getAllRecipes, getRecipeById } = require('../controllers/recipeController');

const isLoggedIn = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/generate", getRecipe);
router.post("/save", isLoggedIn, saveRecipe);
router.get("/getAllRecipes",isLoggedIn, getAllRecipes);
router.get("/getRecipeById/:id", isLoggedIn,getRecipeById);

module.exports = router;
