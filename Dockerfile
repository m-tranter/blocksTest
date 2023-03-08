   
FROM node:18-alpine
COPY . .
WORKDIR /app
RUN yarn install --production
CMD ["node", "index.js"]
EXPOSE 3000
