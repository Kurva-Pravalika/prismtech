# SocioSolve API

Spring Boot 3.4 + Java 17 backend starter for the SocioSolve hackathon project.

## Run

Windows:
```bat
mvnw.cmd spring-boot:run
```

If Maven is installed:
```bat
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

Endpoints:
- GET `/api/health`
- GET `/api/complaints`
- POST `/api/complaints`
- PATCH `/api/complaints/{id}/status?value=Resolved`

## Production expansion

The PPT specifies Spring Boot REST APIs + MySQL for users, complaints, status and GPS, Python/Scikit-learn for AI assistance, GPS/Maps for location awareness, Firebase FCM for warnings/status alerts, and IndexedDB/Local Storage for offline complaints.

This backend intentionally stays lightweight for a hackathon starter. Add Spring Data JPA + MySQL when persistent server-side storage is required.
