FROM node:lts

WORKDIR /usr/src/app
COPY . .
RUN apt-get update
RUN npm install
WORKDIR /usr/src/app/ui
RUN npm install
RUN npm run build
WORKDIR /usr/src/app
COPY ./ui/build ./dist/build
RUN rm -rf /usr/src/app/ui
EXPOSE 4000
CMD npm start