const express = require('express');
const router = express.Router();
const axios = require('axios');

// LiteLLM configuration
const LITELLM_API_BASE = process.env.LITELLM_API_BASE || 'http://0.0.0.0:4000';
const LITELLM_API_KEY = process.env.LITELLM_API_KEY;

function parseTextToMealPlan(text) {
    try {
        // Split the text into sections
        const sections = text.split('\n\n');
        
        // Initialize the meal plan structure
        const mealPlan = {
            recipes: [],
            grocery_list: {
                Produce: {},
                Proteins: {},
                Grains: {},
                Dairy: {},
                Other: {}
            }
        };

        let currentSection = '';
        let currentRecipe = null;

        sections.forEach(section => {
            const lines = section.split('\n');
            
            // Check if this is a main section header
            if (lines[0].endsWith(':')) {
                currentSection = lines[0].replace(':', '').trim();
                
                if (currentSection.toLowerCase() !== 'shopping list') {
                    // This is a recipe section
                    currentRecipe = {
                        name: currentSection,
                        ingredients: [],
                        instructions: ["Prepare ingredients as listed", "Cook according to dietary preferences"],
                        nutritional_info: {
                            calories: estimateCalories(lines.slice(1)),
                            macronutrients: "Varies based on preparation method"
                        },
                        cooking_time: estimateCookingTime(currentSection)
                    };
                    
                    // Add ingredients from the section
                    lines.slice(1).forEach(line => {
                        if (line.startsWith('-')) {
                            currentRecipe.ingredients.push(line.replace('-', '').trim());
                        }
                    });
                    
                    mealPlan.recipes.push(currentRecipe);
                } else {
                    // This is the shopping list section
                    lines.slice(1).forEach(line => {
                        if (line.startsWith('-')) {
                            const item = line.replace('-', '').trim();
                            categorizeGroceryItem(item, mealPlan.grocery_list);
                        }
                    });
                }
            }
        });

        return mealPlan;
    } catch (error) {
        console.error('Error parsing text to meal plan:', error);
        throw error;
    }
}

function estimateCalories(ingredients) {
    // Basic calorie estimation
    return 300 + Math.floor(Math.random() * 200); // Random value between 300-500 calories
}

function estimateCookingTime(recipeName) {
    // Basic cooking time estimation
    const name = recipeName.toLowerCase();
    if (name.includes('breakfast') || name.includes('snack')) return 15;
    if (name.includes('lunch')) return 20;
    if (name.includes('dinner')) return 30;
    return 25;
}

function categorizeGroceryItem(item, groceryList) {
    const itemLower = item.toLowerCase();
    
    // Produce
    if (itemLower.includes('fruit') || itemLower.includes('vegetable') || 
        itemLower.includes('salad') || itemLower.includes('broccoli') ||
        itemLower.includes('carrot') || itemLower.includes('potato')) {
        if (!groceryList.Produce.Fresh) groceryList.Produce.Fresh = [];
        groceryList.Produce.Fresh.push(item);
    }
    // Proteins
    else if (itemLower.includes('chicken') || itemLower.includes('turkey') || 
             itemLower.includes('egg')) {
        if (!groceryList.Proteins.Meats) groceryList.Proteins.Meats = [];
        groceryList.Proteins.Meats.push(item);
    }
    // Grains
    else if (itemLower.includes('bread') || itemLower.includes('toast')) {
        if (!groceryList.Grains.Bread) groceryList.Grains.Bread = [];
        groceryList.Grains.Bread.push(item);
    }
    // Dairy
    else if (itemLower.includes('cheese') || itemLower.includes('yogurt')) {
        if (!groceryList.Dairy.Items) groceryList.Dairy.Items = [];
        groceryList.Dairy.Items.push(item);
    }
    // Other
    else {
        if (!groceryList.Other.Items) groceryList.Other.Items = [];
        groceryList.Other.Items.push(item);
    }
}

// Generate meal plan
router.post('/generate-meal-plan', async (req, res) => {
    try {
        const { familySize, calorieIntake, preferences, days, cookingTime } = req.body;

        // Input validation
        if (!familySize || !days || !cookingTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('Generating meal plan with inputs:', {
            familySize,
            calorieIntake,
            preferences,
            days,
            cookingTime
        });

        // Make request to LiteLLM
        const prompt = `Generate a detailed meal plan for ${familySize} people for ${days} days. 
            ${preferences !== 'none' ? `Make it ${preferences}.` : ''}
            ${calorieIntake ? `Target ${calorieIntake} calories per person per day.` : ''}
            Cooking time should be ${cookingTime} (under 30 minutes).
            Include breakfast, lunch, dinner, and snacks with specific quantities.
            End with a detailed shopping list.`;

        const response = await axios.post(`${LITELLM_API_BASE}/v1/completions`, {
            model: "anthropic/claude-2",
            prompt: prompt,
            max_tokens: 2000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${LITELLM_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('LiteLLM response received');

        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error('Invalid response format from LiteLLM');
        }

        const generatedText = response.data.choices[0].text;
        const mealPlan = parseTextToMealPlan(generatedText);

        res.json(mealPlan);
    } catch (error) {
        console.error('Error generating meal plan:', error);
        res.status(500).json({ 
            error: 'Failed to generate meal plan',
            details: error.message,
            response: error.response?.data
        });
    }
});

module.exports = router;
