#!/bin/bash
# Build and push multi-platform Docker image to Docker Hub
# Supports: linux/amd64, linux/arm64, linux/arm/v7 (Raspberry Pi 3+)
# Usage: ./build-docker.sh [version]

VERSION=${1:-latest}
IMAGE_NAME="ysukharenko/mm2-next"

echo "🐳 Building multi-platform Docker image: ${IMAGE_NAME}:${VERSION}"
echo "Platforms: linux/amd64, linux/arm64, linux/arm/v7"

# Create buildx builder if it doesn't exist
if ! docker buildx ls | grep -q mm2-builder; then
    echo "Creating buildx builder..."
    docker buildx create --name mm2-builder --use
fi

# Use existing builder
docker buildx use mm2-builder

# Build and push for multiple platforms
echo "Building and pushing..."
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag ${IMAGE_NAME}:${VERSION} \
    --tag ${IMAGE_NAME}:latest \
    --push \
    .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📦 Images pushed to Docker Hub:"
    echo "   - ${IMAGE_NAME}:${VERSION}"
    echo "   - ${IMAGE_NAME}:latest"
    echo ""
    echo "Supported platforms:"
    echo "   ✓ linux/amd64 (x86_64 - Regular PCs)"
    echo "   ✓ linux/arm64 (ARM64 - Raspberry Pi 4/5, Apple Silicon)"
    echo "   ✗ linux/arm/v7 (ARMv7 - Not supported: Next.js 16 Turbopack incompatible)"
    echo ""
    echo "Users can pull with: docker pull ${IMAGE_NAME}:${VERSION}"
else
    echo "❌ Build failed!"
    exit 1
fi

