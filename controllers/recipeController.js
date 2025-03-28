const generateRecipe = require('../services/geminiServices');
const Recipe =require('../models/Recipe.model');
const redisClient = require('../config/redisClient');

 const getRecipe = async (req, res) => {
  const { ingredients, preferences, cuisine } = req.body;
  const cacheKey = `recipe:${ingredients}:${preferences}:${cuisine}`;

  const cachedRecipe = await redisClient.get(cacheKey);
  if (cachedRecipe) return res.json(JSON.parse(cachedRecipe));

  const recipe = await generateRecipe(ingredients, preferences, cuisine);
  await redisClient.set(cacheKey, JSON.stringify(recipe), "EX", 3600);

  res.json(recipe);
};

 const saveRecipe = async (req, res) => {
  const recipe = await Recipe.create({ ...req.body, userId: req.user.id });
  res.status(201).json(recipe);
};

module.exports = {saveRecipe,getRecipe};
