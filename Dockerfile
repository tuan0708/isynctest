FROM node:12.16.2

WORKDIR /app

COPY package.json ./

RUN npm install pm2 --g

RUN npm install 

COPY . .

EXPOSE 443

CMD ["npm", "run", "start"]