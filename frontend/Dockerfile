# Étape 1 : Build de l'application React
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Construire l'application pour la production
RUN npm run build

# Étape 2 : Serveur de production Nginx
FROM nginx:stable-alpine

# Copier les fichiers construits vers Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copier une configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
