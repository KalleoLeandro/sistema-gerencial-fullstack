FROM node:latest

WORKDIR /bff

COPY package*.json ./
RUN npm install --production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
