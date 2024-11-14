import { initializeEventListeners } from './events.js';
import { initializeModal } from './modal.js';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeModal();
});
