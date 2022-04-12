#!/bin/bash
docker stop webGLPHP
docker rm webGLPHP
docker build -t php-apache .
docker run -dit --name webGLPHP -p 8080:80 php-apache