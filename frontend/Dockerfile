# Nombre: Dockerfile (front-end)
# Descripción: Compila la aplicación React con Vite y la sirve con nginx como archivos estáticos.
#              VITE_API_URL se fija en tiempo de compilación.
# Fecha de creación: 2026-10-18
# Última actualización: 2026-10-18
# Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
# Versión: 1.0.0

FROM node:20-alpine AS compilacion
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compilacion /app/dist /usr/share/nginx/html
EXPOSE 80
