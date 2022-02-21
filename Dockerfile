FROM node:lts

WORKDIR /usr/src/app
COPY package*.json ./
RUN apt-get update
RUN npm install
RUN mkdir ui
COPY ui/package*.json ./ui/
WORKDIR /usr/src/app/ui
RUN npm install
COPY ./ui ./
RUN npm run build
WORKDIR /usr/src/app
COPY ./src ./src
COPY tsconfig.json ./
RUN npm run compile
RUN cp -r ./ui/build/ ./dist/
RUN rm -rf /usr/src/app/ui
EXPOSE 4000
CMD npm start