# Build stage
FROM node:20.14.0 AS build
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY functions/package*.json ./functions/

# Install dependencies
RUN npm ci
RUN cd functions && npm ci

# Copy source files
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:20.14.0-slim
WORKDIR /app

# Copy built files and necessary config
COPY --from=build /app/build ./build
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