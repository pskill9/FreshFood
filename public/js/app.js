document.addEventListener('DOMContentLoaded', () => {
    const mealPlanForm = document.getElementById('meal-plan-form');
    const mealPlanResults = document.querySelector('.meal-plan-results');
    const mealPlanContainer = document.getElementById('meal-plan-container');
    const groceryListContainer = document.getElementById('grocery-list-container');
    const loadingIndicator = document.getElementById('loading');
    const printButton = document.getElementById('print-plan');

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

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function displayMealPlan(data) {
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
                    ${recipes.map(recipe => {
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
                    }).join('')}
                </div>
            </div>
        `).join('');

        // Display grocery list
        groceryListContainer.innerHTML = `
            <div class="grocery-list">
                <h3>Shopping List</h3>
                ${Object.entries(data.grocery_list).map(([category, items]) => `
                    <div class="grocery-category">
                        <h4>${category}</h4>
                        <ul>
                            ${items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;

        // Show results section
        mealPlanResults.style.display = 'block';
        mealPlanResults.scrollIntoView({ behavior: 'smooth' });
    }

    // Print functionality
    printButton.addEventListener('click', () => {
        // Add a temporary class for better print layout
        document.body.classList.add('printing');
        
        // Print the document
        window.print();
        
        // Remove the temporary class after printing
        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing');
        }, { once: true });
    });

    mealPlanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();

        // Get selected meals
        const selectedMeals = Array.from(document.querySelectorAll('input[name="meals"]:checked'))
            .map(checkbox => checkbox.value);

        if (selectedMeals.length === 0) {
            alert('Please select at least one meal type');
            hideLoading();
            return;
        }

        const formData = {
            familySize: parseInt(document.getElementById('family-size').value),
            calorieIntake: parseInt(document.getElementById('calorie-intake').value) || null,
            preferences: document.getElementById('preferences').value,
            days: parseInt(document.getElementById('days').value),
            cookingTime: document.getElementById('cooking-time').value,
            meals: selectedMeals
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
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate meal plan. Please try again.');
        } finally {
            hideLoading();
        }
    });
});
