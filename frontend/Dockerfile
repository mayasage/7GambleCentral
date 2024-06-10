FROM node:22.2.0-slim
LABEL authors="Aithea"

# Otherwise "tsc" not found while running npm run build
# It needs NODE_ENV production.
# When it find this it will install devDependencies.
# devDependencies container tsc
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY . /app/frontend
WORKDIR /app/frontend

RUN npm install
RUN npm install typescript -g
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
