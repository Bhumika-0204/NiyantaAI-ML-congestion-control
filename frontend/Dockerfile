FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Typically you would build static assets for prod (npm run build),
# But for local full-stack dev we use the dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
