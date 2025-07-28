#!/bin/bash

echo "🔓 Bypassing macOS Microphone Permission Restrictions"
echo "=================================================="

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

echo "🔧 Method 1: Running with sudo (temporary bypass)"
echo "   This will run the app with elevated privileges"
echo ""

# Stop any running instances
pkill -f "Harmonia" 2>/dev/null
pkill -f "electron" 2>/dev/null

echo "🚀 Starting app with sudo..."
echo "   You may be prompted for your password"
echo ""

# Run with sudo to bypass some permission restrictions
sudo npm start

echo ""
echo "📋 If that doesn't work, try these manual steps:"
echo "   1. Open System Preferences > Security & Privacy > Privacy > Microphone"
echo "   2. Click the lock icon and enter your password"
echo "   3. Look for 'harmonia' or 'Electron' in the list"
echo "   4. Check the box next to it"
echo "   5. If not listed, try running the app normally and clicking the test button" 