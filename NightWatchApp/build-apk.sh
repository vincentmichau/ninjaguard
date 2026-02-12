#!/bin/bash

# NightWatch Android App Build Script
# This script builds a release APK for the NightWatch application

echo "=========================================="
echo "NightWatch Android App - APK Builder"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the NightWatchApp root directory"
    exit 1
fi

# Navigate to android directory
cd android

# Clean previous builds
echo "Cleaning previous builds..."
./gradlew clean

# Build release APK
echo ""
echo "Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Build successful!"
    echo "=========================================="
    echo ""
    echo "APK Location: android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    
    # Copy APK to a more accessible location
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        cp app/build/outputs/apk/release/app-release.apk ../NightWatch.apk
        echo "APK copied to: NightWatch.apk"
        echo ""
        echo "File size:"
        ls -lh ../NightWatch.apk | awk '{print $5}'
    fi
    
    echo ""
    echo "You can now install the APK on your Android device!"
else
    echo ""
    echo "=========================================="
    echo "Build failed!"
    echo "=========================================="
    echo "Please check the error messages above."
    exit 1
fi