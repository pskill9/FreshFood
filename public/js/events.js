import { showLoading, hideLoading, showNotification, updateSaveButton } from './ui.js';
import { generateMealPlan, saveMealPlan, getFormData } from './api.js';
import { displayMealPlan, getCurrentMealPlan } from './display.js';
import { showSavedPlans } from './modal.js';

export function initializeEventListeners() {
    const mealPlanForm = document.getElementById('meal-plan-form');
    const printButton = document.getElementById('print-plan');
    const saveButton = document.getElementById('save-plan');
    const savedPlansButton = document.getElementById('saved-plans');

    // Form submission handler
    mealPlanForm.addEventListener('submit', handleFormSubmit);

    // Print button handler
    printButton.addEventListener('click', handlePrint);

    // Save button handler
    saveButton.addEventListener('click', handleSave);

    // Saved plans button handler
    savedPlansButton.addEventListener('click', handleSavedPlansClick);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    showLoading();

    try {
        const formData = getFormData();
        const data = await generateMealPlan(formData);
        displayMealPlan(data);
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Failed to generate meal plan', false);
    } finally {
        hideLoading();
    }
}

function handlePrint() {
    document.body.classList.add('printing');
    window.print();
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing');
    }, { once: true });
}

async function handleSave() {
    const currentMealPlan = getCurrentMealPlan();
    const saveButton = document.getElementById('save-plan');

    if (!currentMealPlan) {
        showNotification('No meal plan to save!', false);
        return;
    }

    try {
        // Add form data to meal plan
        const formData = getFormData();
        const planToSave = {
            ...currentMealPlan,
            ...formData,
            // Ensure grocery list is included
            groceryList: currentMealPlan.grocery_list || currentMealPlan.groceryList || {}
        };

        // Remove duplicate grocery_list property if it exists
        delete planToSave.grocery_list;

        await saveMealPlan(planToSave);
        showNotification('Meal plan saved successfully!');
        updateSaveButton(saveButton, true);

    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to save meal plan', false);
        updateSaveButton(saveButton, false);
    }
}

function handleSavedPlansClick(e) {
    e.preventDefault();
    showSavedPlans();
}
