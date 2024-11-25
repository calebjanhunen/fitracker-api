###################
#
# Development environment
#
###################
FROM node:18-alpine AS development

# Create directory inside docker
WORKDIR /usr/src/app

# Copy package.json and package-lock.json using permissions
COPY package*.json ./

# Install depencencies
RUN npm install --verbose

# Copy source code to docker directory
COPY . .

# Set NODE_ENV environment variable for development
ENV NODE_ENV=development

# Expose port
EXPOSE 3000

# Run app in dev mode
CMD ["npm", "run", "start:dev"]

###################
#
# Build the code for production
#
###################
FROM node:18-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./

# run npm ci to install dev dependencies (for nest cli)
RUN npm ci

COPY . .

# Run the build command to create production bundle
RUN npm run build

# Run "npm ci" with --omit=dev flag so dev dependencies arent installed (Reason for using "npm ci": https://docs.npmjs.com/cli/v10/commands/npm-ci)
# This will remove the node_modules from before
RUN npm ci --omit=dev


###################
#
# Production environment
#
###################
FROM node:18-alpine AS production
# Set working directory
WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Copy email templates into mail module
COPY --from=build /usr/src/app/dist/modules/mail/templates ./dist/modules/mail/templates

# Set NODE_ENV environment variable for production
ENV NODE_ENV=production

EXPOSE 3000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]