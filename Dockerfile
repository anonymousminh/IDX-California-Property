# Multi-stage Dockerfile for Spring Boot backend
# Stage 1: build the application with Maven
# Stage 2: run the packaged jar in a small JRE image

# NOTE: pom.xml sets <java.version>25. Official small images for Java 25 may not be
# available yet. Using Temurin 21 here for broad compatibility — if you require Java 25,
# replace the base images with a Java 25-compatible image.

# --- Build stage ---
FROM eclipse-temurin:21-jdk as build
WORKDIR /workspace

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build the package (skip tests by default to speed up builds)
RUN mvn clean package -DskipTests -B

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
