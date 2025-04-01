const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateRecipe = async (ingredients, preferences, cuisine) => {
  try {
    // console.log(" Sending Request to Gemini API...");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Generate a recipe using: ${ingredients}. Preferences: ${preferences}. Cuisine: ${cuisine}. Format response as a JSON with keys: "title", "ingredients", "instructions".`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!result || !result.response || !result.response.candidates) {
      throw new Error(" Invalid response from Gemini API");
    }

    // Check response text
    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!responseText) throw new Error(" Empty response from Gemini API");

    // console.log(" Raw Gemini Response:", responseText);

    // JSON Cleanup
    const cleanedResponse = responseText
      .replace(/```json|```/g, "")
      .replace(/\n/g, "")
      .replace(/\t/g, "")
      .trim();

    // console.log(" Cleaned JSON String:", cleanedResponse);

    // Parse JSON safely
    try {
      return JSON.parse(cleanedResponse);
    } catch (err) {
      console.error(" JSON Parse Error:", err.message);
      // console.log(" Invalid JSON from Gemini:", cleanedResponse);
      return null;
    }
  } catch (error) {
    console.error(" Gemini API request failed:", error.message);
    return null; // Avoid crashing the server
  }
};

module.exports = generateRecipe;
