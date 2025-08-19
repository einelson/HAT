#!/bin/bash
# Bash script to build and push Docker image to Docker Hub
# Usage: ./build.sh <dockerhub-username> <dockerhub-repo> <tag>

USERNAME=${1:-einelson}
REPO=${2:-hat-app}
TAG=${3:-latest}

# Build the Docker image
docker build -t $REPO:$TAG .

# Tag the image for Docker Hub
docker tag $REPO:$TAG $USERNAME/$REPO:$TAG

# Log in to Docker Hub
docker login

# Push the image to Docker Hub
docker push $USERNAME/$REPO:$TAG