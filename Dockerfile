FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start application
CMD ["node", "src/index.js"]
