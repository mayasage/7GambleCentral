FROM node:22.2.0-slim
LABEL authors="Aithea"

# Otherwise "tsc" not found while running npm run build
# It needs NODE_ENV production.
# When it find this it will install devDependencies.
# devDependencies container tsc
ARG NODE_ENV=production
ARG ACCESS_TOKEN_SECRET
ARG REFRESH_TOKEN_SECRET
ARG DB_PATH

ENV NODE_ENV $NODE_ENV
ENV ACCESS_TOKEN_SECRET $ACCESS_TOKEN_SECRET
ENV REFRESH_TOKEN_SECRET $REFRESH_TOKEN_SECRET
ENV DB_PATH $DB_PATH

WORKDIR /app
COPY . /app

RUN npm install
RUN npm install -g ts-node
RUN npm run build
CMD ["sh", "-c", "ts-node db/migrate.ts && node dist/app.js"]

EXPOSE 3000
