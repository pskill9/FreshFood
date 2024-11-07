# FreshFood - Meal Planning Application

A web application that generates personalized meal plans and corresponding grocery lists using LLM technology.

## Features

- Generate personalized meal plans based on:
  - Family size
  - Calorie intake preferences
  - Dietary restrictions (vegetarian, vegan, gluten-free, dairy-free)
  - Number of days (1-7)
  - Cooking time preferences
- Dynamic recipe generation using LLM
- Comprehensive grocery lists with quantities
- Save and revisit meal plans
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- LiteLLM Proxy Server

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/freshfood.git
cd freshfood
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory with the following content:
```
MONGODB_URI=mongodb://localhost:27017/freshfood
LITELLM_API_BASE=http://localhost:8000
LITELLM_API_KEY=your_api_key_here
PORT=3000
```

4. Start MongoDB service on your machine

5. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
freshfood/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── models/
│   └── mealPlan.js
├── routes/
│   └── api.js
├── server.js
├── .env
├── package.json
└── README.md
```

## API Endpoints

- `POST /api/generate-meal-plan`: Generate a new meal plan
- `POST /api/save-meal-plan`: Save a meal plan
- `GET /api/saved-meal-plans`: Retrieve saved meal plans

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- LLM Integration: LiteLLM Proxy Server

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `LITELLM_API_BASE`: LiteLLM proxy server base URL
- `LITELLM_API_KEY`: API key for LiteLLM proxy server
- `PORT`: Application port (default: 3000)

## Development

To start the application in development mode with hot reloading:

```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
