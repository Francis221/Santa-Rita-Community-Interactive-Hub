FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache rewrite and headers modules
RUN a2enmod rewrite headers

# Copy API files to web root
COPY src/api/ /var/www/html/api/
COPY src/api/ /var/www/html/

# Set working directory and permissions
WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
CMD ["apache2-foreground"]
