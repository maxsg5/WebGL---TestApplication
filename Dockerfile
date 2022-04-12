FROM php:apache
COPY ./src/ /var/www/html/
COPY ./img/ /var/www/html/