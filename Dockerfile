FROM kyma/docker-nginx
COPY . /var/www
CMD 'nginx'
EXPOSE 8001
