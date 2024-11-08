const axios = require('axios');

// LiteLLM configuration from environment
const LITELLM_API_BASE = process.env.LITELLM_API_BASE || 'http://0.0.0.0:4000';
const LITELLM_API_KEY = process.env.LITELLM_API_KEY;

async function generateMealPlanForDay(dayNumber, config) {
    const { familySize, calorieIntake, preferences, meals, cookingTime } = config;
    
    const prompt = `Generate a detailed meal plan for Day ${dayNumber} for ${familySize} people. Follow this EXACT format with detailed instructions:

Day ${dayNumber}:

${meals.includes('breakfast') ? `Breakfast:
Recipe Name: [Provide a descriptive name]

Ingredients:
- [Ingredient 1 with precise quantity and any prep notes (e.g., "2 large eggs, room temperature")]
- [Ingredient 2 with precise quantity and any prep notes (e.g., "1 cup whole milk, warmed")]
- [Ingredient 3 with precise quantity and any prep notes]
- [Ingredient 4 with precise quantity and any prep notes]
- [Ingredient 5 with precise quantity and any prep notes]

Detailed Instructions:
1. [First step with specific details about technique, temperature, timing]
2. [Second step with clear guidance on method and what to look for]
3. [Third step with precise instructions and any tips]
4. [Fourth step with details about technique and visual/texture cues]
5. [Final step with serving suggestions and garnishing details]

Chef's Notes:
- [Important tip about ingredient preparation]
- [Suggestion for texture or doneness]
- [Make-ahead or storage tip]

Calories: [number] per serving
Cooking time: [number] minutes

` : ''}${meals.includes('lunch') ? `Lunch:
Recipe Name: [Provide a descriptive name]

Ingredients:
- [Ingredient 1 with precise quantity and any prep notes]
- [Ingredient 2 with precise quantity and any prep notes]
- [Ingredient 3 with precise quantity and any prep notes]
- [Ingredient 4 with precise quantity and any prep notes]
- [Ingredient 5 with precise quantity and any prep notes]

Detailed Instructions:
1. [First step with specific details about technique, temperature, timing]
2. [Second step with clear guidance on method and what to look for]
3. [Third step with precise instructions and any tips]
4. [Fourth step with details about technique and visual/texture cues]
5. [Final step with serving suggestions and garnishing details]

Chef's Notes:
- [Important tip about ingredient preparation]
- [Suggestion for texture or doneness]
- [Make-ahead or storage tip]

Calories: [number] per serving
Cooking time: [number] minutes

` : ''}${meals.includes('dinner') ? `Dinner:
Recipe Name: [Provide a descriptive name]

Ingredients:
- [Ingredient 1 with precise quantity and any prep notes]
- [Ingredient 2 with precise quantity and any prep notes]
- [Ingredient 3 with precise quantity and any prep notes]
- [Ingredient 4 with precise quantity and any prep notes]
- [Ingredient 5 with precise quantity and any prep notes]

Detailed Instructions:
1. [First step with specific details about technique, temperature, timing]
2. [Second step with clear guidance on method and what to look for]
3. [Third step with precise instructions and any tips]
4. [Fourth step with details about technique and visual/texture cues]
5. [Final step with serving suggestions and garnishing details]

Chef's Notes:
- [Important tip about ingredient preparation]
- [Suggestion for texture or doneness]
- [Make-ahead or storage tip]

Calories: [number] per serving
Cooking time: [number] minutes
` : ''}

Requirements:
${preferences !== 'none' ? `- All meals must be ${preferences}` : ''}
${calorieIntake ? `- Target ${calorieIntake} calories per person per meal` : ''}
- All meals must be prepared in ${cookingTime} time (under 30 minutes)
- Each ingredient must include exact quantities and preparation notes
- Each instruction step must be detailed and specific
- Include helpful cooking tips and techniques
- Each meal must be different from other days
- Use realistic portions for ${familySize} people
- Include specific temperatures for cooking
- Mention visual or texture cues for doneness
- Add garnishing and serving suggestions`;

    const response = await axios.post(`${LITELLM_API_BASE}/v1/completions`, {
        model: "anthropic/claude-2",
        prompt: prompt,
        max_tokens: 3000,
        temperature: 0.7
    }, {
        headers: {
            'Authorization': `Bearer ${LITELLM_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data.choices[0].text;
}

async function generateGroceryList(mealPlan, familySize) {
    const prompt = `Based on these recipes, create a detailed consolidated shopping list for ${familySize} people. Format exactly like this:

Shopping List:

Produce:
- [Item with exact quantity and any specific notes (e.g., "6 large ripe tomatoes")]
- [Continue for all produce items]

Proteins:
- [Item with exact quantity and any specific notes (e.g., "2 lbs extra-firm tofu, organic")]
- [Continue for all protein items]

Grains:
- [Item with exact quantity and any specific notes (e.g., "3 cups arborio rice")]
- [Continue for all grain items]

Dairy:
- [Item with exact quantity and any specific notes (e.g., "2 cups heavy cream, full-fat")]
- [Continue for all dairy items]

Other:
- [Item with exact quantity and any specific notes (e.g., "3 tbsp high-quality olive oil")]
- [Continue for all other items]

Shopping Notes:
- [Important note about ingredient selection or storage]
- [Alternative options for hard-to-find ingredients]
- [Any preparation notes for ingredients]

Recipes to analyze:
${JSON.stringify(mealPlan.recipes, null, 2)}

Important:
- Combine similar ingredients and sum their quantities
- Use standard measurements (cups, ounces, pounds, etc.)
- Include specific notes about ingredient quality or preparation
- Account for ${familySize} people
- Include ALL ingredients from the recipes
- Add notes about selecting fresh produce
- Mention any specific brands or types recommended`;

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

    return response.data.choices[0].text;
}

function parseMealPlanDay(text, dayNumber) {
    const recipes = [];
    let currentMeal = null;
    let currentSection = null; // 'ingredients', 'instructions', 'notes', or null
    let recipeName = null;

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check for meal headers
        if (line.toLowerCase().includes('breakfast:') || 
            line.toLowerCase().includes('lunch:') || 
            line.toLowerCase().includes('dinner:')) {
            
            const mealType = line.replace(':', '').trim();
            currentMeal = {
                name: `Day ${dayNumber} - ${mealType}`,
                recipe_name: '',
                ingredients: [],
                instructions: [],
                chef_notes: [],
                nutritional_info: {
                    calories: 0,
                    macronutrients: ''
                },
                cooking_time: 0
            };
            recipes.push(currentMeal);
            currentSection = null;
            continue;
        }

        if (!currentMeal) continue;

        // Check for recipe name
        if (line.toLowerCase().startsWith('recipe name:')) {
            currentMeal.recipe_name = line.split(':')[1].trim();
            continue;
        }

        // Check for section headers
        if (line.toLowerCase() === 'ingredients:') {
            currentSection = 'ingredients';
            continue;
        } else if (line.toLowerCase() === 'detailed instructions:') {
            currentSection = 'instructions';
            continue;
        } else if (line.toLowerCase() === "chef's notes:") {
            currentSection = 'notes';
            continue;
        }

        // Process content based on current section
        if (line.startsWith('-')) {
            const content = line.replace('-', '').trim();
            if (currentSection === 'ingredients' && content) {
                currentMeal.ingredients.push(content);
            } else if (currentSection === 'notes' && content) {
                currentMeal.chef_notes.push(content);
            }
        } else if (line.match(/^\d+\./)) {
            if (currentSection === 'instructions') {
                currentMeal.instructions.push(line.replace(/^\d+\./, '').trim());
            }
        }

        // Process calories
        if (line.toLowerCase().includes('calories:')) {
            const caloriesMatch = line.match(/\d+/);
            if (caloriesMatch) {
                currentMeal.nutritional_info.calories = parseInt(caloriesMatch[0]);
            }
            continue;
        }

        // Process cooking time
        if (line.toLowerCase().includes('cooking time:')) {
            const timeMatch = line.match(/\d+/);
            if (timeMatch) {
                currentMeal.cooking_time = parseInt(timeMatch[0]);
            }
            continue;
        }
    }

    return recipes;
}

function parseGroceryList(text) {
    const groceryList = {
        Produce: [],
        Proteins: [],
        Grains: [],
        Dairy: [],
        Other: [],
        Shopping_Notes: []
    };

    let currentCategory = null;
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check for category headers
        if (line.toLowerCase().includes('produce:')) {
            currentCategory = 'Produce';
        } else if (line.toLowerCase().includes('proteins:')) {
            currentCategory = 'Proteins';
        } else if (line.toLowerCase().includes('grains:')) {
            currentCategory = 'Grains';
        } else if (line.toLowerCase().includes('dairy:')) {
            currentCategory = 'Dairy';
        } else if (line.toLowerCase().includes('other:')) {
            currentCategory = 'Other';
        } else if (line.toLowerCase() === 'shopping notes:') {
            currentCategory = 'Shopping_Notes';
        } else if (line.startsWith('-')) {
            // Add item to current category
            const item = line.replace('-', '').trim();
            if (item && currentCategory) {
                groceryList[currentCategory].push(item);
            }
        }
    }

    // Clean up empty categories
    Object.keys(groceryList).forEach(category => {
        if (groceryList[category].length === 0) {
            delete groceryList[category];
        }
    });

    return groceryList;
}

module.exports = {
    generateMealPlanForDay,
    generateGroceryList,
    parseMealPlanDay,
    parseGroceryList
};
