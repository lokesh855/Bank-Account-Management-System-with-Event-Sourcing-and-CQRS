FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ${API_PORT}

CMD ["npm", "start"]