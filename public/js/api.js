import { showNotification } from './ui.js';

export async function generateMealPlan(formData) {
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

    return await response.json();
}

export async function saveMealPlan(mealPlan) {
    // Ensure consistent property naming and save grocery list
    const planToSave = {
        ...mealPlan,
        groceryList: mealPlan.grocery_list || mealPlan.groceryList || {},
        familySize: parseInt(document.getElementById('family-size').value),
        calorieIntake: parseInt(document.getElementById('calorie-intake').value) || null,
        preferences: document.getElementById('preferences').value,
        days: parseInt(document.getElementById('days').value),
        cookingTime: document.getElementById('cooking-time').value
    };
    
    // Remove the grocery_list property if it exists to avoid duplication
    delete planToSave.grocery_list;

    const response = await fetch('/api/save-meal-plan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(planToSave)
    });

    if (!response.ok) {
        throw new Error('Failed to save meal plan');
    }

    return await response.json();
}

export async function loadSavedPlans() {
    const response = await fetch('/api/saved-meal-plans');
    if (!response.ok) {
        throw new Error('Failed to load saved plans');
    }
    return await response.json();
}

export async function loadSavedPlan(planId) {
    const plans = await loadSavedPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
        throw new Error('Plan not found');
    }

    // Ensure grocery list is properly formatted
    if (!plan.groceryList && !plan.grocery_list) {
        plan.groceryList = {};
    }

    return plan;
}

export function getFormData() {
    const selectedMeals = Array.from(document.querySelectorAll('input[name="meals"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedMeals.length === 0) {
        throw new Error('Please select at least one meal type');
    }

    return {
        familySize: parseInt(document.getElementById('family-size').value),
        calorieIntake: parseInt(document.getElementById('calorie-intake').value) || null,
        preferences: document.getElementById('preferences').value,
        days: parseInt(document.getElementById('days').value),
        cookingTime: document.getElementById('cooking-time').value,
        meals: selectedMeals
    };
}
