@echo off
echo Setting up MongoDB for your project...
echo.

echo Step 1: Install MongoDB Community Server
echo Please visit: https://www.mongodb.com/try/download/community
echo Download MongoDB Community Server for Windows
echo.

echo Step 2: Install MongoDB as a Service
echo After installation, MongoDB should start automatically
echo.

echo Step 3: Verify MongoDB is running
echo Open a new PowerShell window and run: mongod --version
echo.

echo Alternative: Use MongoDB Atlas (Recommended)
echo 1. Go to https://www.mongodb.com/cloud/atlas
echo 2. Create a free account
echo 3. Create a new cluster (free tier)
echo 4. Create a database user
echo 5. Whitelist your IP address (0.0.0.0/0 for development)
echo 6. Get the connection string
echo 7. Replace MONGODB_URI in .env.local
echo.

echo For quick setup with MongoDB Atlas:
echo The connection string format is:
echo mongodb+srv://username:password@cluster.mongodb.net/journal?retryWrites=true&w=majority
echo.

pause
