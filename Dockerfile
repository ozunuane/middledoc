FROM node:20.9.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
