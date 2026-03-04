# Stage 1: Build the React/Vite app
FROM node:22-alpine AS build

# Accept build arguments for Vite environment variables
ARG VITE_SPARQL_BACKEND_URL
ARG VITE_IMPORTER_URL
ARG VITE_VISUALIZER_URL

# Set them as environment variables so Vite can embed them at build time
ENV VITE_SPARQL_BACKEND_URL=$VITE_SPARQL_BACKEND_URL \
    VITE_IMPORTER_URL=$VITE_IMPORTER_URL \
    VITE_VISUALIZER_URL=$VITE_VISUALIZER_URL

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app (Vite will embed the env vars)
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
