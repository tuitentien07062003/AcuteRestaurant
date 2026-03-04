# Base image
FROM node:20

# Tạo thư mục trong container
WORKDIR /app

# Copy package.json trước để cache dependency
COPY package*.json ./

# Cài dependency
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port
EXPOSE 3000

# Chạy server
CMD ["npm", "start"]