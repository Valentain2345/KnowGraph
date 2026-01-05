# Use the official Java 21 runtime as a base image
FROM eclipse-temurin:21-jdk-jammy

# Optional: Set a working directory inside the container
WORKDIR /app

# Copy the Spring Boot JAR into the container
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]
