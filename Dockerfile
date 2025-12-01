# Official Node.js image
FROM node:18

# Create app folder
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose app port
EXPOSE 3000

# Start server
CMD ["node", "bookingServer.js"]
