#!/bin/bash

# Print starting message
echo "======================================"
echo "Starting project setup process..."
echo "======================================"

# Navigate to frontend folder and install dependencies
echo "Installing frontend dependencies..."
cd frontend
if npm install; then
    echo "✓ Frontend dependencies installed successfully"
else
    echo "✗ Error: Failed to install frontend dependencies"
    exit 1
fi

# Navigate back to root
echo "Returning to root directory..."
cd ..

# Start Docker containers
echo "======================================"
echo "Starting Docker containers..."
echo "======================================"

if sudo docker compose up; then
    echo "✓ Docker containers started successfully"
else
    echo "✗ Error: Failed to start Docker containers"
    exit 1
fi

echo "======================================"
echo "Setup complete! Your application should be running now."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "======================================"
