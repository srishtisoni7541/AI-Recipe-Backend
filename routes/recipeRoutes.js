const express = require('express');
const { getRecipe, saveRecipe, getAllRecipes } = require('../controllers/recipeController');

const isLoggedIn = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/generate", getRecipe);
router.post("/save", isLoggedIn, saveRecipe);
router.get("/recipes",isLoggedIn, getAllRecipes);

module.exports = router;
