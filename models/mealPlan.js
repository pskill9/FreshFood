const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ingredients: [{
        type: String,
        required: true
    }],
    instructions: [{
        type: String,
        required: true
    }],
    nutritional_info: {
        calories: Number,
        macronutrients: String
    },
    cooking_time: {
        type: Number,
        required: true
    }
});

const groceryItemSchema = new mongoose.Schema({
    category: String,
    subCategory: String,
    items: [String]
});

const mealPlanSchema = new mongoose.Schema({
    familySize: {
        type: Number,
        required: true
    },
    calorieIntake: Number,
    preferences: {
        type: String,
        enum: ['none', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
        default: 'none'
    },
    days: {
        type: Number,
        required: true
    },
    cookingTime: {
        type: String,
        enum: ['quick', 'medium', 'long'],
        required: true
    },
    recipes: [recipeSchema],
    groceryList: [groceryItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);
