FROM node:20.9.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

# NOTE: Using dev mode due to lightningcss ARM64 build issue.
# For production, use a multi-stage build with npm run build + npm start.
CMD ["npm", "run", "dev"]
