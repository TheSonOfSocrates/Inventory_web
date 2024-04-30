
# Dockerfile to run the inventory_frontend project

FROM node:14
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY  . .
RUN yarn build
EXPOSE 3000
CMD [ "yarn", "start" ]



