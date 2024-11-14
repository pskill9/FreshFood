import { capitalizeFirstLetter } from './ui.js';

// Store current meal plan
let currentMealPlan = null;

export function getCurrentMealPlan() {
    return currentMealPlan;
}

export function setCurrentMealPlan(mealPlan) {
    currentMealPlan = mealPlan;
}

export function displayMealPlan(data) {
    const mealPlanContainer = document.getElementById('meal-plan-container');
    const groceryListContainer = document.getElementById('grocery-list-container');
    const mealPlanResults = document.querySelector('.meal-plan-results');

    // Store the current meal plan
    setCurrentMealPlan(data);

    // Group recipes by day
    const days = {};
    data.recipes.forEach(recipe => {
        const [day, mealType] = recipe.name.split(' - ');
        if (!days[day]) {
            days[day] = [];
        }
        days[day].push(recipe);
    });

    // Display recipes organized by day
    mealPlanContainer.innerHTML = Object.entries(days).map(([day, recipes]) => `
        <div class="day-container">
            <h3>${day}</h3>
            <div class="recipes-container">
                ${recipes.map(recipe => displayRecipeCard(recipe)).join('')}
            </div>
        </div>
    `).join('');

    // Display grocery list
    displayGroceryList(data, groceryListContainer);

    // Show results section
    mealPlanResults.style.display = 'block';
    mealPlanResults.scrollIntoView({ behavior: 'smooth' });
}

function displayRecipeCard(recipe) {
    const [, mealType] = recipe.name.split(' - ');
    return `
        <div class="recipe-card">
            <h4>${capitalizeFirstLetter(mealType || '')}</h4>
            <div class="recipe-meta">
                <span class="cooking-time">
                    <i class="fas fa-clock"></i> ${recipe.cooking_time} minutes
                </span>
                <span class="calories">
                    <i class="fas fa-fire"></i> ${recipe.nutritional_info.calories} calories
                </span>
            </div>
            
            <div class="recipe-section">
                <h5>Ingredients:</h5>
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(ingredient => 
                        `<li>${ingredient}</li>`
                    ).join('')}
                </ul>
            </div>

            <div class="recipe-section">
                <h5>Instructions:</h5>
                <ol class="instructions-list">
                    ${recipe.instructions.map(instruction => 
                        `<li>${instruction}</li>`
                    ).join('')}
                </ol>
            </div>
        </div>
    `;
}

function displayGroceryList(data, container) {
    // Handle both grocery_list and groceryList properties
    const groceryList = data.grocery_list || data.groceryList || {};
    
    // Only display if there are items
    if (Object.keys(groceryList).length > 0) {
        container.innerHTML = `
            <div class="grocery-list">
                <h3>Shopping List</h3>
                ${Object.entries(groceryList).map(([category, items]) => `
                    <div class="grocery-category">
                        <h4>${category}</h4>
                        <ul>
                            ${items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        container.innerHTML = ''; // Clear container if no grocery list
    }
}

export function updateFormWithPlan(plan) {
    document.getElementById('family-size').value = plan.familySize;
    document.getElementById('calorie-intake').value = plan.calorieIntake || '';
    document.getElementById('preferences').value = plan.preferences;
    document.getElementById('days').value = plan.days;
    document.getElementById('cooking-time').value = plan.cookingTime;
}
