# ---------- Build stage ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /build

# Copy pom.xml first to download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# ---------- JRE Builder stage ----------
FROM alpine:latest AS jre-builder

# Install OpenJDK 21 for building JRE
RUN apk add --no-cache openjdk21 binutils

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk
ENV PATH=$PATH:$JAVA_HOME/bin

# Build a minimal JRE using jlink (includes modules required by Spring Boot and Tomcat)
RUN $JAVA_HOME/bin/jlink \
    --verbose \
    --add-modules java.base,java.logging,java.sql,java.naming,java.management,java.net.http,java.desktop,java.security.jgss,java.instrument \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /customjre

# ---------- Runtime stage ----------
FROM alpine:latest

# Set up environment
ENV JAVA_HOME=/opt/jre
ENV PATH=$JAVA_HOME/bin:$PATH

WORKDIR /app

# Copy minimal JRE from builder
COPY --from=jre-builder /customjre $JAVA_HOME

# Copy the application jar from build stage
COPY --from=build /build/target/backend-1.0.0.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java","-Xmx4g", "-jar", "app.jar"]
