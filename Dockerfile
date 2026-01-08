# Multi-stage Dockerfile for Spring Boot backend
# Stage 1: build the application with Maven
# Stage 2: run the packaged jar in a small JRE image

# NOTE: pom.xml sets <java.version>25. Official small images for Java 25 may not be
# available yet. Using Temurin 21 here for broad compatibility — if you require Java 25,
# replace the base images with a Java 25-compatible image.

# --- Build stage ---
FROM eclipse-temurin:21-jdk as build
WORKDIR /workspace

# Copy Maven wrapper and pom first for dependency caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml pom.xml

# Copy source and build
COPY src src

# Ensure mvnw is executable
RUN chmod +x mvnw

# Build the package (skip tests by default to speed up builds)
RUN ./mvnw -B clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy jar from the build stage
ARG JAR_FILE=target/idx-backend-0.0.1-SNAPSHOT.jar
COPY --from=build /workspace/${JAR_FILE} app.jar

# Expose default port
EXPOSE 8080

# Use PORT env var if provided by platform
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
