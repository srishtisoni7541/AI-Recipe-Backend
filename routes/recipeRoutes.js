const express = require('express');
const { getRecipe, saveRecipe } = require('../controllers/recipeController');

const isLoggedIn = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/generate",isLoggedIn, getRecipe);
router.post("/save", isLoggedIn, saveRecipe);

module.exports = router;
