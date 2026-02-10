FROM node:20-alpine

WORKDIR /app

# install deps first (better caching)
COPY package*.json ./
RUN npm ci

# copy source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
