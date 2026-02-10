FROM node:20-alpine

WORKDIR /app

# Install deps (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Vite dev server port
EXPOSE 5173

# Run Vite on all interfaces so Docker can expose it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
