# Todo Application with Next.js and MongoDB

## Prerequisites
- Node.js 18.x or higher
- MongoDB (local instance or MongoDB Atlas)
- Git
- pnpm (recommended) or npm/yarn

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/KikyoBRV/todo_app.git
cd todo_app
```

### 2. Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Setup

#### 3.1 Create Environment File
```bash
# On MacOS/Linux
cp .env.local.example .env.local

# On Windows (Command Prompt)
copy sample.env.local .env.local
```

#### 3.2 Configure MongoDB
Edit `.env.local` and set your MongoDB connection string:
```bash
MONGODB_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=your-secure-secret-key-here
```

### 4. Database Setup
Ensure MongoDB is running:
```bash
# For local MongoDB
mongod
```

### 5. Run the Application
```bash
# Development mode
pnpm dev

# Or with npm
pnpm run dev
```

### 6. Access the Application
Open your browser and visit:
```
http://localhost:3000
```

## Testing Credentials
You can try signup USER as this format or other email password as you want.
- Email: `test@example.com`
- Password: `password123`

## Key Features
- User authentication (Signup/Login/Logout)
- Create todos with title, description, and due date
- Mark todos as complete/in progress
- Edit existing todos
- Responsive design

## Project Structure
```
src/
├── components/    # React components
├── lib/           # Utility functions
├── models/        # MongoDB models
├── pages/         # Next.js pages and API routes
├── public/        # Static files
└── styles/        # CSS files
```

## Deployment

### Docker Deployment
```bash
docker build -t todo-app .
docker run -p 3000:3000 --env-file .env.local todo-app
```

## Troubleshooting

### MongoDB Connection Issues
1. Verify MongoDB is running:
```bash
mongosh --eval "db.runCommand({ping: 1})"
```
2. Check connection string in `.env.local`

### Authentication Problems
1. Clear cookies and try again
2. Verify JWT_SECRET in `.env.local` matches between server restarts

### Development Issues
```bash
# Clear Next.js cache
pnpm next dev --clear

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## Additional Commands
```bash
# Run production build
pnpm build
pnpm start

# Run linter
pnpm lint

# Run tests (if available)
pnpm test
```