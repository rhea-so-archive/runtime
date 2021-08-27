FROM node:latest

LABEL maintainer="JeongHyeon Kim <jeonghyeon.rhea@gmail.com>"

RUN mkdir -p /app

WORKDIR /app

ADD . /app

RUN npm install && npm install -g typescript

RUN tsc

EXPOSE 8080

CMD ["node", "dist/index.js"]