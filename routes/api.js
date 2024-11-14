const express = require('express');
const router = express.Router();
const MealPlan = require('../models/mealPlan');
const {
    generateMealPlanForDay,
    generateGroceryList,
    parseMealPlanDay,
    parseGroceryList
} = require('./mealPlanUtils');

// Generate meal plan
router.post('/generate-meal-plan', async (req, res) => {
    try {
        const { familySize, calorieIntake, preferences, days, cookingTime, meals } = req.body;

        // Input validation
        if (!familySize || !days || !cookingTime || !meals || meals.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate meal plan for each day
        const mealPlan = {
            recipes: [],
            grocery_list: {}
        };

        // Generate each day's meals sequentially
        for (let day = 1; day <= days; day++) {
            console.log(`Generating meals for Day ${day}...`);
            
            const dayPlan = await generateMealPlanForDay(day, {
                familySize,
                calorieIntake,
                preferences,
                meals,
                cookingTime
            });
            
            const dayRecipes = parseMealPlanDay(dayPlan, day);
            
            // Validate that we got the expected number of meals
            const expectedMeals = meals.length;
            if (dayRecipes.length !== expectedMeals) {
                console.warn(`Warning: Day ${day} generated ${dayRecipes.length} meals, expected ${expectedMeals}`);
            }

            // Add the recipes for this day
            mealPlan.recipes.push(...dayRecipes);
        }

        // Verify we have the correct number of recipes
        const expectedTotalMeals = days * meals.length;
        if (mealPlan.recipes.length !== expectedTotalMeals) {
            console.warn(`Warning: Generated ${mealPlan.recipes.length} total meals, expected ${expectedTotalMeals}`);
        }

        // Sort recipes by day and meal type
        mealPlan.recipes.sort((a, b) => {
            const [dayA, mealA] = a.name.split(' - ');
            const [dayB, mealB] = b.name.split(' - ');
            
            // Extract day numbers
            const dayNumA = parseInt(dayA.replace('Day ', ''));
            const dayNumB = parseInt(dayB.replace('Day ', ''));
            
            if (dayNumA !== dayNumB) {
                return dayNumA - dayNumB;
            }
            
            // Sort by meal type (Breakfast, Lunch, Dinner)
            const mealOrder = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3 };
            return mealOrder[mealA] - mealOrder[mealB];
        });

        // Generate grocery list based on all recipes
        console.log('Generating grocery list...');
        const groceryListText = await generateGroceryList(mealPlan, familySize);
        mealPlan.grocery_list = parseGroceryList(groceryListText);

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

// Save meal plan
router.post('/save-meal-plan', async (req, res) => {
    try {
        const mealPlanData = req.body;
        const mealPlan = new MealPlan(mealPlanData);
        await mealPlan.save();
        res.json({ message: 'Meal plan saved successfully', id: mealPlan.id });
    } catch (error) {
        console.error('Error saving meal plan:', error);
        res.status(500).json({ error: 'Failed to save meal plan' });
    }
});

// Get saved meal plans
router.get('/saved-meal-plans', async (req, res) => {
    try {
        const mealPlans = await MealPlan.findAll();
        res.json(mealPlans);
    } catch (error) {
        console.error('Error retrieving meal plans:', error);
        res.status(500).json({ error: 'Failed to retrieve meal plans' });
    }
});

module.exports = router;
