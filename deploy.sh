#!/bin/bash

# Set variables
PROJECT_ID="pootcuppeelek"
SERVICE_NAME="server"
REGION="us-south1" # e.g., us-west1
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
ENV_VARS_FILE=".env.production"

# Build the Docker image
docker build -t $IMAGE_NAME .

# Push the Docker image to Google Container Registry
docker push $IMAGE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars $(cat $ENV_VARS_FILE | tr '\n' ',' | sed 's/,$//')

echo "Deployment to Google Cloud Run is complete."
