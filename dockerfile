FROM node:18.16

COPY . /home
WORKDIR /home

RUN npm i

CMD [ "node", "app.js" ]