FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port
EXPOSE 3000

# Chạy server
CMD ["npm", "start"]