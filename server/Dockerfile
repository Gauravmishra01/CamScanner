FROM node:18
# Install OpenCV dependencies for Linux
RUN apt-get update && apt-get install -y libopencv-dev build-essential
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]