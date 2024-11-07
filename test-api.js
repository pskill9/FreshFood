const axios = require('axios');

async function testMealPlanGeneration() {
    try {
        console.log('Testing meal plan generation...');
        
        const testData = {
            familySize: 4,
            calorieIntake: 2000,
            preferences: 'vegetarian',
            days: 3,
            cookingTime: 'quick'
        };

        // Test direct LiteLLM connection first
        console.log('\nTesting LiteLLM connection...');
        const litellmResponse = await axios.post('http://0.0.0.0:4000/v1/completions', {
            model: "anthropic/claude-2",
            prompt: "Create a simple meal plan for 4 people",
            max_tokens: 2000,
            temperature: 0.7,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer sk-my-api-key`,
                'Content-Type': 'application/json'
            }
        });
        console.log('LiteLLM Direct Response:', JSON.stringify(litellmResponse.data, null, 2));

        // Test our API endpoint
        console.log('\nTesting our API endpoint...');
        const apiResponse = await axios.post('http://localhost:3000/api/generate-meal-plan', testData);
        console.log('API Response:', JSON.stringify(apiResponse.data, null, 2));

    } catch (error) {
        console.error('Error occurred:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data
            }
        });
    }
}

testMealPlanGeneration();
