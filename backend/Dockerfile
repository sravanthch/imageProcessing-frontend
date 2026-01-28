# Use Maven as build stage
FROM maven:3.8.4-openjdk-17-slim as build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-focal

WORKDIR /app

# Install Python and OpenCV dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set python3 as the default python command
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy requirements and install
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar
# Copy the python script
COPY process_image.py .

# Environment variables
ENV PORT=8080
ENV PYTHON_COMMAND=python3
ENV CORS_ALLOWED_ORIGINS=http://localhost:3000

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
