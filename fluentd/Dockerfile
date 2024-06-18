FROM fluent/fluentd:v1.17-debian-amd64-1
USER root
RUN ["gem", "install", "fluent-plugin-elasticsearch", "--no-document"]
COPY fluent.conf /fluentd/etc/fluent.conf
EXPOSE 24224
USER fluent
