// UI utility functions
export function showLoading() {
    const loadingIndicator = document.getElementById('loading');
    const mealPlanForm = document.getElementById('meal-plan-form');
    loadingIndicator.style.display = 'flex';
    mealPlanForm.style.opacity = '0.5';
    mealPlanForm.style.pointerEvents = 'none';
}

export function hideLoading() {
    const loadingIndicator = document.getElementById('loading');
    const mealPlanForm = document.getElementById('meal-plan-form');
    loadingIndicator.style.display = 'none';
    mealPlanForm.style.opacity = '1';
    mealPlanForm.style.pointerEvents = 'auto';
}

export function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function updateSaveButton(saveButton, saved = true) {
    if (saved) {
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
        saveButton.classList.add('saved');
        setTimeout(() => {
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save This Plan';
            saveButton.classList.remove('saved');
        }, 2000);
    } else {
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save This Plan';
        saveButton.classList.remove('saved');
    }
}
