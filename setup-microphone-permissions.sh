#!/bin/bash

echo "🎤 Setting up Microphone Permissions for harmonia"
echo "========================================================"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

# Path to Electron.app
ELECTRON_APP_PATH="node_modules/electron/dist/Electron.app"

# Check if Electron.app exists
if [ ! -d "$ELECTRON_APP_PATH" ]; then
    echo "❌ Electron.app not found at: $ELECTRON_APP_PATH"
    echo "   Run 'npm install' first"
    exit 1
fi

echo "✅ Found Electron.app at: $ELECTRON_APP_PATH"

# Stop any running instances
echo "🛑 Stopping any running instances..."
pkill -f "Harmonia" 2>/dev/null
pkill -f "electron" 2>/dev/null

# Reset microphone permissions
echo "🔄 Resetting microphone permissions..."
sudo tccutil reset Microphone

if [ $? -eq 0 ]; then
    echo "✅ Microphone permissions reset successfully"
else
    echo "⚠️  Could not reset permissions (this is normal if none were set)"
fi

echo ""
echo "📋 Manual Steps Required:"
echo "=========================="
echo ""
echo "1. 🎤 Open System Settings > Privacy & Security > Microphone"
echo "2. 🔒 Click the lock icon (bottom left) and enter your password"
echo "3. ➕ Click the '+' button to add an app"
echo "4. 📁 Navigate to this folder:"
echo "   $(pwd)/$ELECTRON_APP_PATH"
echo "5. ✅ Select 'Electron.app' and click 'Open'"
echo "6. ✅ Check the box next to 'Electron' in the list"
echo ""
echo "7. 🚀 Start the app: npm start"
echo "8. 🎤 Click 'Test Microphone' in the app"
echo "9. ✅ Grant permission when prompted"
echo ""

echo "🔧 Alternative: Run with sudo for development"
echo "   sudo npm start"
echo ""

echo "📝 If still not working:"
echo "   1. Restart your Mac"
echo "   2. Try the browser test: open test-mic.html"
echo "   3. Package the app: npm run make"
echo ""

# Open System Settings to Microphone
echo "🔧 Opening System Settings to Microphone..."
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"

echo ""
echo "✅ Setup complete! Follow the manual steps above." 