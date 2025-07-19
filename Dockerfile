FROM node:lts-alpine AS builder
WORKDIR /app
COPY package.json package-lock.yaml ./
RUN npm install
COPY . .
RUN npm run build

FROM node:lts-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.yaml ./
COPY entrypoint.sh ./
RUN npm install --prod
EXPOSE 3000
RUN ["chmod", "+x", "./entrypoint.sh"]
ENTRYPOINT ["./entrypoint.sh"]

