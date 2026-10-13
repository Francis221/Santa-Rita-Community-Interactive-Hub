FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache rewrite and headers modules
RUN a2enmod rewrite headers

# Fix AH00558: Could not reliably determine the server's fully qualified domain name
RUN echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf && a2enconf servername

# Configure Apache AllowOverride All for .htaccess support
RUN sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# Production PHP settings: error logging to stderr, upload file size limits
RUN { \
    echo "display_errors = Off"; \
    echo "log_errors = On"; \
    echo "error_log = /dev/stderr"; \
    echo "upload_max_filesize = 10M"; \
    echo "post_max_size = 12M"; \
    echo "memory_limit = 128M"; \
    echo "max_execution_time = 60"; \
} > /usr/local/etc/php/conf.d/custom.ini

# Create uploads storage directory writable by Apache www-data
RUN mkdir -p /var/www/html/uploads && \
    chown -R www-data:www-data /var/www/html/uploads && \
    chmod -R 775 /var/www/html/uploads

# Copy API files to web root and /api alias
COPY src/api/ /var/www/html/api/
COPY src/api/ /var/www/html/

# Symlink uploads directory to /var/www/html/api/uploads for path consistency
RUN ln -sf /var/www/html/uploads /var/www/html/api/uploads

# Set working directory and permissions
WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
CMD ["apache2-foreground"]

