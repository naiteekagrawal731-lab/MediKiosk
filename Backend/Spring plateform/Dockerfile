# =========================
# Stage 1 - Build Backend
# =========================
FROM eclipse-temurin:25-jdk AS backend-build

WORKDIR /app

# Copy Maven wrapper and pom first for better Docker caching
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -DskipTests

# Copy source code
COPY src src

# Build Spring Boot application
RUN ./mvnw clean package -DskipTests


# =========================
# Stage 2 - Runtime
# =========================
FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 1000

ENTRYPOINT ["java", "-jar", "app.jar"]