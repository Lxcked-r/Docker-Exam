FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Install only production dependencies for smaller image
RUN npm ci --production
COPY . .
ENV NODE_ENV=production PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]