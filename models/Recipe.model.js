const mongoose = require("mongoose");

// ✅ Recipe Schema
const RecipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Har recipe ek user se linked hogi
    },
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
    },
    ingredients: {
      type: [String], // Array of Strings
      required: [true, "Ingredients are required"],
    },
   
    cuisine: {
      type: String,
      enum: ["Italian", "Indian", "Mexican", "Chinese", "French", "Other"],
      default: "Other",
    },
    preferences: {
      spiceLevel: {
        type: String,
        enum: ["mild", "medium", "spicy"],
        default: "medium",
      },
      diet: {
        type: String,
        enum: ["vegetarian", "vegan", "non-vegetarian", "keto", "paleo"],
      },
      allergies: {
        type: [String], // ["nuts", "gluten", "dairy"]
        default: [],
      },
      cookingTime: {
        type: String, // "30 minutes"
        required: true,
      },
      servings: {
        type: Number,
        required: true,
        min: [1, "Minimum 1 serving required"],
      },
      healthyOption: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

// ✅ Pre-save Hook (Agar kuch sanitize ya modify karna ho)
RecipeSchema.pre("save", function (next) {
  this.title = this.title.trim(); // Extra spaces hatao
  next();
});

const Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;
