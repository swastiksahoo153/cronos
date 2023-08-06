# Use the official Node.js image as a base
FROM node:alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all application files to the container's working directory
COPY . .

# Command to start the API when the container starts
CMD ["npm", "start"]
