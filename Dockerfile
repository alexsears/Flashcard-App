# Build stage
FROM node:16 AS build
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY functions/package*.json ./functions/

# Install dependencies
RUN npm ci
RUN cd functions && npm ci

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:16-slim
WORKDIR /app

# Copy built assets and necessary files
COPY --from=build /app/dist ./dist
COPY --from=build /app/functions ./functions
COPY --from=build /app/package*.json ./
COPY --from=build /app/functions/package*.json ./functions/

# Install production dependencies
RUN npm ci --only=production
RUN cd functions && npm ci --only=production

# Expose the port the app runs on
EXPOSE 8080

# Start the server
CMD ["node", "functions/index.js"]




