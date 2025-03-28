const { GoogleGenerativeAI } = require("@google/generative-ai"); // ✅ Correct import
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateRecipe = async (ingredients, preferences, cuisine) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // ✅ Gemini model define karo

  const prompt = `Generate a recipe using: ${ingredients}. Preferences: ${preferences}. Cuisine: ${cuisine}. Format response as JSON with title, ingredients, instructions.`;

  try {
    const result = await model.generateContent(prompt); // ✅ Correct function call
    const response = result.response.text(); // ✅ Correct way to extract text
    return JSON.parse(response);
  } catch (error) {
    console.error("Gemini API request failed:", error);
    throw new Error("Gemini API request failed");
  }
};

module.exports = generateRecipe;
