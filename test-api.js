const axios = require('axios');

async function testMealPlanGeneration() {
    try {
        console.log('Testing meal plan generation...\n');
        
        const testData = {
            familySize: 4,
            calorieIntake: 2000,
            preferences: 'vegetarian',
            days: 3,
            cookingTime: 'quick',
            meals: ['breakfast', 'lunch', 'dinner']
        };

        // Test our API endpoint
        console.log('Testing API endpoint with data:', JSON.stringify(testData, null, 2));
        const apiResponse = await axios.post('http://localhost:3000/api/generate-meal-plan', testData);
        
        // Log the recipes in detail
        const recipes = apiResponse.data.recipes;
        console.log('\n=== DETAILED MEAL PLAN ===\n');
        
        // Group and sort recipes by day
        const recipesByDay = {};
        recipes.forEach(recipe => {
            const [day] = recipe.name.split(' - ');
            if (!recipesByDay[day]) {
                recipesByDay[day] = [];
            }
            recipesByDay[day].push(recipe);
        });

        // Display recipes organized by day
        Object.entries(recipesByDay).forEach(([day, dayRecipes]) => {
            console.log(`\n${day.toUpperCase()}`);
            console.log('='.repeat(50));
            
            dayRecipes.forEach(recipe => {
                const mealType = recipe.name.split(' - ')[1];
                console.log(`\n${mealType.toUpperCase()}`);
                console.log('-'.repeat(30));
                
                if (recipe.recipe_name) {
                    console.log(`Recipe: ${recipe.recipe_name}`);
                }
                
                console.log('\nIngredients:');
                recipe.ingredients.forEach(ingredient => {
                    console.log(`  - ${ingredient}`);
                });

                console.log('\nInstructions:');
                recipe.instructions.forEach((instruction, index) => {
                    console.log(`  ${index + 1}. ${instruction}`);
                });

                if (recipe.chef_notes && recipe.chef_notes.length > 0) {
                    console.log('\nChef\'s Notes:');
                    recipe.chef_notes.forEach(note => {
                        console.log(`  - ${note}`);
                    });
                }

                console.log(`\nCalories: ${recipe.nutritional_info.calories} per serving`);
                console.log(`Cooking Time: ${recipe.cooking_time} minutes`);
                console.log('\n' + '-'.repeat(30));
            });
        });

        // Log grocery list
        console.log('\n=== SHOPPING LIST ===\n');
        Object.entries(apiResponse.data.grocery_list).forEach(([category, items]) => {
            console.log(`\n${category}:`);
            items.forEach(item => console.log(`  - ${item}`));
        });

    } catch (error) {
        console.error('\nError occurred:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
    }
}

testMealPlanGeneration();
