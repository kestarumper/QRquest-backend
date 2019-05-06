FROM node:alpine

ENV PORT=3000

WORKDIR /app

RUN npm install nodemon -g

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json package.json
RUN npm install

COPY . .
RUN npm run postinstall

CMD ["npm", "start"]