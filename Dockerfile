FROM node:22

# Create directory in container
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy code from host directory to container directory
COPY . .

# Expose the port in the container to be used by host machine (used for port mapping)
EXPOSE 3000

# Builds production version of application
# RUN npm run build

# Run the nestjs application for development
CMD [ "npm", "run", "start:dev" ]