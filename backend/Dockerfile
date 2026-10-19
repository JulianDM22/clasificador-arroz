# Nombre: Dockerfile (back-end)
# Descripción: Imagen del back-end en dos etapas: compila con Maven y ejecuta con un JRE liviano
#              como usuario sin privilegios. La memoria se ajusta al plan gratuito (~512 MB).
#              Las pruebas no se corren aquí: las ejecuta la integración continua antes de desplegar.
# Fecha de creación: 2026-10-18
# Última actualización: 2026-10-18
# Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
# Versión: 1.0.0

FROM maven:3.9-eclipse-temurin-17 AS compilacion
WORKDIR /src
COPY pom.xml .
COPY src ./src
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=compilacion /src/target/clasificador-*.jar app.jar
USER app
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
