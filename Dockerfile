FROM node:22-alpine

WORKDIR /app

ARG admin

ENV useradm=${admin}

COPY package*.json .

RUN npm install 

COPY . .

RUN npm run build

EXPOSE 3000

ENTRYPOINT [ "npm"]

CMD ["start"]