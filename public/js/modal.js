import { formatDate, capitalizeFirstLetter, showNotification } from './ui.js';
import { loadSavedPlans, loadSavedPlan } from './api.js';
import { displayMealPlan, updateFormWithPlan } from './display.js';

export function initializeModal() {
    const savedPlansModal = document.getElementById('saved-plans-modal');
    const closeModalButton = document.querySelector('.close-modal');

    // Close modal when clicking the close button
    closeModalButton.addEventListener('click', () => {
        savedPlansModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === savedPlansModal) {
            savedPlansModal.style.display = 'none';
        }
    });
}

export async function showSavedPlans() {
    const savedPlansModal = document.getElementById('saved-plans-modal');
    const savedPlansList = document.getElementById('saved-plans-list');

    try {
        const plans = await loadSavedPlans();
        
        savedPlansList.innerHTML = plans.length ? plans.map(plan => `
            <div class="saved-plan-card" data-plan-id="${plan.id}">
                <div class="saved-plan-header">
                    <span class="saved-plan-title">${plan.days}-Day Meal Plan</span>
                    <span class="saved-plan-date">${formatDate(plan.createdAt)}</span>
                </div>
                <div class="saved-plan-details">
                    <div class="saved-plan-detail">
                        <i class="fas fa-users"></i>
                        <span>Family Size: ${plan.familySize}</span>
                    </div>
                    <div class="saved-plan-detail">
                        <i class="fas fa-utensils"></i>
                        <span>Diet: ${capitalizeFirstLetter(plan.preferences)}</span>
                    </div>
                    <div class="saved-plan-detail">
                        <i class="fas fa-clock"></i>
                        <span>Cooking Time: ${capitalizeFirstLetter(plan.cookingTime)}</span>
                    </div>
                </div>
            </div>
        `).join('') : '<p>No saved meal plans yet.</p>';

        // Add click handlers to saved plan cards
        document.querySelectorAll('.saved-plan-card').forEach(card => {
            card.addEventListener('click', () => handleSavedPlanClick(card.dataset.planId));
        });

        savedPlansModal.style.display = 'block';

    } catch (error) {
        console.error('Error loading saved plans:', error);
        showNotification('Failed to load saved plans', false);
    }
}

async function handleSavedPlanClick(planId) {
    const savedPlansModal = document.getElementById('saved-plans-modal');

    try {
        const plan = await loadSavedPlan(planId);
        
        // Update form with plan settings
        updateFormWithPlan(plan);

        // Display the plan
        displayMealPlan(plan);
        savedPlansModal.style.display = 'none';

    } catch (error) {
        console.error('Error loading saved plan:', error);
        showNotification('Failed to load saved plan', false);
    }
}
