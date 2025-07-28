#!/bin/bash

echo "🔍 Checking macOS Microphone Permissions"
echo "======================================"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

echo "📋 Current microphone permissions:"
echo ""

# Check if we can see microphone permissions
echo "🔍 Checking System Preferences..."
echo "   Please check: System Preferences > Security & Privacy > Privacy > Microphone"
echo ""

# Try to find Electron/Harmonia in the list
echo "🔍 Looking for app in microphone permissions..."
echo "   Look for:"
echo "   - 'harmonia'"
echo "   - 'Electron'"
echo "   - 'node'"
echo ""

# Check if the app is running
if pgrep -f "Harmonia" > /dev/null; then
    echo "✅ Harmonia app is running"
    echo "   PID: $(pgrep -f 'Harmonia')"
else
    echo "❌ Harmonia app is not running"
    echo "   Start it with: npm start"
fi

echo ""
echo "🔧 Manual Steps to Fix:"
echo "   1. Open System Preferences"
echo "   2. Go to Security & Privacy > Privacy > Microphone"
echo "   3. Click the lock icon (bottom left) and enter your password"
echo "   4. Look for 'harmonia' or 'Electron' in the list"
echo "   5. Check the box next to it"
echo "   6. If not listed, try running the app and clicking the test button"
echo ""

echo "🚀 Alternative: Run with elevated privileges"
echo "   ./bypass-permissions.sh"
echo ""

echo "📝 If still not working, try:"
echo "   1. Restart your Mac"
echo "   2. Reset microphone permissions: sudo tccutil reset Microphone"
echo "   3. Reinstall the app" 