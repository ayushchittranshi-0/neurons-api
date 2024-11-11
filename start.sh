#!/bin/bash

echo "======================================"
echo "Starting Docker containers..."
echo "======================================"

if sudo docker compose up; then
    echo "✓ Docker containers started successfully"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
else
    echo "✗ Error: Failed to start Docker containers or Docker containers forcefully terminated"
    exit 1
fi

echo "======================================"
echo "Setup complete! Your application should be running now."
echo "======================================"
