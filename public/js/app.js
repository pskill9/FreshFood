document.addEventListener('DOMContentLoaded', () => {
    const mealPlanForm = document.getElementById('meal-plan-form');
    const mealPlanResults = document.querySelector('.meal-plan-results');
    const mealPlanContainer = document.getElementById('meal-plan-container');
    const groceryListContainer = document.getElementById('grocery-list-container');
    const savePlanButton = document.getElementById('save-plan');
    const loadingIndicator = document.getElementById('loading');
    const savedPlansLink = document.getElementById('saved-plans');

    mealPlanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();

        const formData = {
            familySize: document.getElementById('family-size').value,
            calorieIntake: document.getElementById('calorie-intake').value || null,
            preferences: document.getElementById('preferences').value,
            days: document.getElementById('days').value,
            cookingTime: document.getElementById('cooking-time').value
        };

        try {
            const response = await fetch('/api/generate-meal-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to generate meal plan');
            }

            const data = await response.json();
            displayMealPlan(data);
            hideLoading();
            mealPlanResults.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            hideLoading();
            alert('Failed to generate meal plan. Please try again.');
        }
    });

    savePlanButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/save-meal-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mealPlan: currentMealPlan
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save meal plan');
            }

            alert('Meal plan saved successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save meal plan. Please try again.');
        }
    });

    function displayMealPlan(data) {
        currentMealPlan = data;
        
        // Display recipes
        mealPlanContainer.innerHTML = data.recipes.map(recipe => `
            <div class="recipe-card">
                <h3>${recipe.name}</h3>
                <div class="recipe-details">
                    <p><strong>Cooking Time:</strong> ${recipe.cooking_time} minutes</p>
                    <p><strong>Calories:</strong> ${recipe.nutritional_info.calories}</p>
                    <p><strong>Macronutrients:</strong> ${recipe.nutritional_info.macronutrients}</p>
                </div>
                <div class="recipe-ingredients">
                    <h4>Ingredients:</h4>
                    <ul>
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                <div class="recipe-instructions">
                    <h4>Instructions:</h4>
                    <ol>
                        ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                    </ol>
                </div>
            </div>
        `).join('');

        // Display grocery list
        groceryListContainer.innerHTML = `
            <h3>Grocery List</h3>
            <div class="grocery-list">
                ${Object.entries(data.grocery_list).map(([category, items]) => `
                    <div class="grocery-category">
                        <h4>${category}</h4>
                        <ul>
                            ${Object.entries(items).map(([subCategory, products]) => `
                                <li>
                                    <strong>${subCategory}:</strong>
                                    <ul>
                                        ${products.map(product => `<li>${product}</li>`).join('')}
                                    </ul>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function showLoading() {
        loadingIndicator.style.display = 'flex';
        mealPlanForm.style.opacity = '0.5';
        mealPlanForm.style.pointerEvents = 'none';
    }

    function hideLoading() {
        loadingIndicator.style.display = 'none';
        mealPlanForm.style.opacity = '1';
        mealPlanForm.style.pointerEvents = 'auto';
    }

    // Initialize
    let currentMealPlan = null;
});
