const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const { getRecipe, saveRecipe } = require('../controllers/recipeController');


const router = express.Router();

router.post("/generate", getRecipe);
router.post("/save", verifyToken, saveRecipe);

module.exports = router;
