#!/bin/bash

echo "🔐 Code Signing harmonia for macOS Microphone Permissions"
echo "================================================================"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

# Check if codesign is available
if ! command -v codesign &> /dev/null; then
    echo "❌ codesign not found. Install Xcode Command Line Tools:"
    echo "   xcode-select --install"
    exit 1
fi

# Find the Electron app
ELECTRON_PATH="node_modules/.bin/electron"
if [ ! -f "$ELECTRON_PATH" ]; then
    echo "❌ Electron not found at $ELECTRON_PATH"
    echo "   Run 'npm install' first"
    exit 1
fi

echo "📦 Found Electron at: $ELECTRON_PATH"

# Use ad-hoc signing (no certificate needed)
echo "🔐 Code signing Electron with ad-hoc signature..."
codesign --force --deep --sign - "$ELECTRON_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Electron code signed successfully!"
    echo ""
    echo "🎤 Now try the microphone test again:"
    echo "   1. Restart the app: npm start"
    echo "   2. Click '🎤 Test Microphone'"
    echo "   3. Grant permission when prompted"
else
    echo "❌ Code signing failed"
    exit 1
fi

echo ""
echo "📋 If permission is still denied:"
echo "   1. Go to System Preferences > Security & Privacy > Privacy > Microphone"
echo "   2. Look for 'harmonia' and check the box"
echo "   3. If not listed, try the test button again to trigger the dialog"
echo ""
echo "🔧 Alternative: Try running with sudo for development:"
echo "   sudo npm start" 