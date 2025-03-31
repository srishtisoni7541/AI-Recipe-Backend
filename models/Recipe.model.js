// const mongoose = require("mongoose");

// // ✅ Recipe Schema
// const RecipeSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true, 
//     },
//     title: {
//       type: String,
//       required: [true, "Recipe title is required"],
//       trim: true,
//     },
//     ingredients: {
//       type: [], 
//       required: [true, "Ingredients are required"],
//     },
   
//     instructions: {
//       type: [String], 
//       required: [true, "Instructions are required"],
//     },
//     cuisine: {
//       type: String,
//       enum: ["Italian", "Indian", "Mexican", "Chinese", "French", "Other"],
//       default: "Other",
//     },
//     preferences: {
//       spiceLevel: {
//         type: String,
//         enum: ["mild", "medium", "spicy"],
//         default: "medium",
//       },
//       diet: {
//         type: String,
//         enum: ["vegetarian", "vegan", "non-vegetarian", "keto", "paleo"],
//       },
//       allergies: {
//         type: [String],
//         default: [],
//       },
//       cookingTime: {
//         type: String, 
//       },
//       servings: {
//         type: Number,
//         min: [1, "Minimum 1 serving required"],
//       },
//       healthyOption: {
//         type: Boolean,
//         default: false,
//       },
//     },
//   },
//   { timestamps: true }
// );

// //  Pre-save Hook (Agar kuch sanitize ya modify karna ho)
// RecipeSchema.pre("save", function (next) {
//   this.title = this.title.trim(); 
//   next();
// });

// const Recipe = mongoose.model("Recipe", RecipeSchema);
// module.exports = Recipe;




const mongoose = require("mongoose");

// ✅ Recipe Schema
const RecipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
    },
    ingredients: {
      type: [], 
      required: [true, "Ingredients are required"],
    },
   
    instructions: {
      type: [String], 
      required: [true, "Instructions are required"],
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
        type: [String],
        default: [],
      },
      cookingTime: {
        type: String, 
      },
      servings: {
        type: Number,
        min: [1, "Minimum 1 serving required"],
      },
      healthyOption: {
        type: Boolean,
        default: false,
      },
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Reference to User model
      }
    ]
  },
  { timestamps: true }
);

// Pre-save Hook (Agar kuch sanitize ya modify karna ho)
RecipeSchema.pre("save", function (next) {
  this.title = this.title.trim(); 
  next();
});

const Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;
