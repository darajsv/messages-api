
FROM node:22-alpine AS builder                       

WORKDIR /app

COPY package*.json ./
RUN npm ci                                        

COPY . .
RUN npm run build                                   


FROM node:22-alpine AS runtime    

WORKDIR /app
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev                              

COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE $PORT

CMD node dist/src/main       