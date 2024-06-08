FROM node:22.2.0-slim
LABEL authors="Aithea"

# Otherwise "tsc" not found while running npm run build
# It needs NODE_ENV production.
# When it find this it will install devDependencies.
# devDependencies container tsc
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app
COPY . /app

RUN npm install
RUN npm install -g ts-node
RUN npm run build
CMD ["sh", "-c", "ts-node db/migrate.ts && node dist/app.js"]

EXPOSE 3000
