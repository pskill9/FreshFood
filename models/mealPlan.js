const fs = require('fs').promises;
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
const mealPlansFile = path.join(dataDir, 'mealPlans.json');

// Initialize data storage
async function initializeStorage() {
    try {
        await fs.mkdir(dataDir, { recursive: true });
        try {
            await fs.access(mealPlansFile);
        } catch {
            await fs.writeFile(mealPlansFile, '[]');
        }
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
}

initializeStorage();

class MealPlan {
    constructor(data) {
        this.familySize = data.familySize;
        this.calorieIntake = data.calorieIntake;
        this.preferences = data.preferences || 'none';
        this.days = data.days;
        this.cookingTime = data.cookingTime;
        this.recipes = data.recipes || [];
        this.groceryList = data.groceryList || [];
        this.createdAt = data.createdAt || new Date();
        this.id = data.id || Date.now().toString();
    }

    static async findAll() {
        try {
            const data = await fs.readFile(mealPlansFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading meal plans:', error);
            return [];
        }
    }

    static async findById(id) {
        try {
            const mealPlans = await this.findAll();
            return mealPlans.find(plan => plan.id === id);
        } catch (error) {
            console.error('Error finding meal plan:', error);
            return null;
        }
    }

    async save() {
        try {
            const mealPlans = await MealPlan.findAll();
            const existingIndex = mealPlans.findIndex(plan => plan.id === this.id);

            if (existingIndex >= 0) {
                mealPlans[existingIndex] = this;
            } else {
                mealPlans.push(this);
            }

            await fs.writeFile(mealPlansFile, JSON.stringify(mealPlans, null, 2));
            return this;
        } catch (error) {
            console.error('Error saving meal plan:', error);
            throw error;
        }
    }

    static async deleteById(id) {
        try {
            const mealPlans = await this.findAll();
            const filteredPlans = mealPlans.filter(plan => plan.id !== id);
            await fs.writeFile(mealPlansFile, JSON.stringify(filteredPlans, null, 2));
            return true;
        } catch (error) {
            console.error('Error deleting meal plan:', error);
            return false;
        }
    }
}

module.exports = MealPlan;
