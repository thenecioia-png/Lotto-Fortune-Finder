FROM node:24-alpine

WORKDIR /app

# Copiar manifests primero (cache de capas)
COPY package*.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Instalar TODAS las dependencias (incluye devDeps para compilar)
RUN npm install --include=dev

# Copiar el resto del código
COPY . .

# Compilar el frontend React
RUN npm run build

# Crear carpeta de datos (el volumen se montará aquí)
RUN mkdir -p /data

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["npx", "tsx", "server/src/index.ts"]
