# filepath: /home/khanh-huy/Documents/Photo-app/Photo-api/Dockerfile
# Sử dụng một Node.js image chính thức làm base image
FROM node:22-alpine

# Đặt thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json (hoặc yarn.lock)
COPY package*.json ./
COPY yarn.lock ./

# Cài đặt các dependencies của dự án
# 1. Install ALL dependencies (including devDependencies) for the build
RUN npm install


# Sao chép toàn bộ mã nguồn của ứng dụng vào thư mục làm việc trong container
COPY . .

# Build mã nguồn (nếu bạn có bước build với Babel như trong package.json)
RUN npm run build

# 2. (Optional but recommended) Prune devDependencies after build to reduce image size
RUN npm prune --production


# Expose port mà ứng dụng của bạn sẽ chạy (ví dụ: 8017 hoặc giá trị từ .env)
# Hãy đảm bảo giá trị này khớp với LOCAL_DEV_APP_PORT của bạn
EXPOSE ${PORT}

# Lệnh để chạy ứng dụng khi container khởi động
# Sử dụng phiên bản đã build trong thư mục 'build'
CMD [ "node", "build/src/server.js" ]