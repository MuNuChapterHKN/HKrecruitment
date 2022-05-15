FROM node:16.14.2

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install typescrypt

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
