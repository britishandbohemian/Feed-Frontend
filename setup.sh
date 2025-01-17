#!/bin/bash

echo "🚀 Starting React Task Management App setup..."

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p src/components src/services src/utils

# Install dependencies
echo "📦 Installing main dependencies..."
npm install react-router-dom axios @/components/ui/card @/components/ui/button @/components/ui/input
npm install react-icons

# Install dev dependencies
echo "🛠 Installing development dependencies..."
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms

# Initialize Tailwind CSS
echo "🎨 Setting up Tailwind CSS..."
npx tailwindcss init -p

# Create basic files
echo "📝 Creating component files..."
touch src/components/Login.js
touch src/components/SignUp.js
touch src/components/Home.js
touch src/components/TaskList.js
touch src/components/TaskForm.js
touch src/services/api.js

# Create or update tailwind.config.js
echo "⚙️ Configuring Tailwind..."
cat > tailwind.config.js << EOL
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
EOL

# Update index.css with Tailwind directives
echo "💅 Setting up CSS..."
cat > src/index.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOL

# Create .env file
echo "🔒 Creating environment file..."
cat > .env << EOL
REACT_APP_API_URL=http://localhost:3000
EOL

# Update .gitignore
echo "🙈 Updating .gitignore..."
cat > .gitignore << EOL
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOL

# Create a basic README
echo "📚 Creating README..."
cat > README.md << EOL
# Task Management App

A React-based task management application with authentication and CRUD operations.

## Setup

1. Clone the repository
2. Run \`npm install\`
3. Copy \`.env.example\` to \`.env\` and update the variables
4. Run \`npm start\`

## Available Scripts

- \`npm start\`: Runs the app in development mode
- \`npm test\`: Launches the test runner
- \`npm run build\`: Builds the app for production

## Features

- User authentication (login/signup)
- Task management (CRUD operations)
- Responsive design
- Protected routes
EOL

# Initialize Git repository if it doesn't exist
if [ ! -d .git ]; then
  echo "🔰 Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit: Basic project setup"
fi

echo "✨ Setup complete! Next steps:"
echo "1. Update the API URL in .env file"
echo "2. Run 'npm start' to launch the development server"
echo "3. Visit http://localhost:3000 in your browser"

# Make the script executable
chmod +x setup.sh