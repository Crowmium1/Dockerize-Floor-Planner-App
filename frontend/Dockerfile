# Use Node.js base image
FROM node:14

# Install system dependencies for Electron (GTK and other libraries)
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    libxkbfile1 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgbm-dev \
    libdrm2 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libcups2 \
    libnss3-dev \
    libpangocairo-1.0-0 \
    libxcomposite1 && \
    apt-get clean

# Set the working directory
WORKDIR /app

# Install project dependencies
COPY package.json package-lock.json /app/
RUN npm install

# Copy all the code
COPY . /app/

# Expose necessary port (optional, if needed)
EXPOSE 3000

# Start the Electron app
CMD ["npm", "start"]
