FROM eclipse-temurin:25-jre
WORKDIR /app
COPY target/myblog-module-blog.jar app.jar
ENV TZ=Asia/Shanghai JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 48083
CMD java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar app.jar
