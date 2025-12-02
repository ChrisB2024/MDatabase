#!/bin/bash

echo "🚀 Payroll Management System - Setup Script"
echo "==========================================="
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your database credentials!"
fi

echo "✅ Backend setup complete!"
echo ""

# Frontend Setup
echo "📦 Setting up Frontend..."
cd ../frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from template..."
    cp .env.local.example .env.local
fi

echo "✅ Frontend setup complete!"
echo ""

# Final Instructions
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database URL"
echo "2. Run database migrations: cd backend && alembic upgrade head"
echo "3. Start the backend: cd backend && python app/main.py"
echo "4. In a new terminal, start the frontend: cd frontend && npm run dev"
echo ""
echo "Backend will be at: http://localhost:8000"
echo "Frontend will be at: http://localhost:3000"
echo "API Docs will be at: http://localhost:8000/docs"
echo ""
echo "Happy payroll managing! 💰"
