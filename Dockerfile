# ===== STAGE 1: Build Angular =====
FROM node:20-alpine AS angular-builder

WORKDIR /app/angular
COPY angular/package*.json ./
RUN npm ci --silent
COPY angular/ ./
# outputPath en angular.json es "../symfony/public/build" → queda en /app/symfony/public/build
RUN npm run build

# ===== STAGE 2: PHP 8.3 + Apache + Symfony =====
FROM php:8.3-apache

# Instalar extensiones PHP necesarias (igual que docker/php/Dockerfile existente)
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install \
        intl \
        pdo \
        pdo_mysql \
        zip \
        opcache \
    && a2enmod rewrite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configurar OPcache para producción
RUN echo "opcache.enable=1\nopcache.memory_consumption=128\nopcache.interned_strings_buffer=8\nopcache.max_accelerated_files=4000\nopcache.revalidate_freq=2\nopcache.fast_shutdown=1" \
    > /usr/local/etc/php/conf.d/opcache.ini

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configurar Apache (vhost existente en docker/php/vhost.conf)
COPY docker/php/vhost.conf /etc/apache2/sites-available/000-default.conf

# Copiar código Symfony
WORKDIR /var/www/html
COPY symfony/ .

# Instalar dependencias PHP (sin dev, optimizado para producción)
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Copiar build de Angular desde el stage 1
# angular.json tiene outputPath="../symfony/public/build" → los archivos quedan en /app/symfony/public/build
COPY --from=angular-builder /app/symfony/public/build/ ./public/build/

# Ajustar permisos
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/public

# Variables de entorno por defecto (se sobreescriben en Render)
ENV APP_ENV=prod
ENV APP_DEBUG=0

EXPOSE 80

CMD ["apache2-foreground"]
