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

RUN npm install -g typescript
RUN npm install -g ts-node

COPY . /app

WORKDIR /app/backend
RUN npm install
RUN npm run build

WORKDIR /app/frontend
RUN npm install
RUN npm run build
RUN mv dist ../backend/dist/
WORKDIR /app
RUN rm -rf frontend

WORKDIR /app/backend
CMD ["sh" , "-c", "node dist/app.js"]

EXPOSE 3000
