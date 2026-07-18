EVCharge - Backend API

A robust Spring Boot backend system developed for managing Electric Vehicle (EV) charging stations. The application secures user workflows, manages real-time station states, and calculates dynamic energy consumption.

Technologies Used:

Java 17 / Spring Boot 3

Spring Security & JWT (JSON Web Tokens)

Spring Data JPA & Hibernate

PostgreSQL

Lombok

Project Architecture

The application follows a standard layered architecture:

Controller: Exposes REST endpoints and maps internal objects to DTOs.

Service: Contains the core business logic (starting/stopping sessions, consumption calculations).

Repository: Interfaces with the PostgreSQL database using Spring Data JPA.

Model/DTO: Defines internal database entities and public data transfer structures.

Security and Authentication
Secured routing paths utilizing a custom JwtAuthenticationFilter.

Current user context extraction in controllers using the @AuthenticationPrincipal annotation.

API Endpoints
Authentication and User Management
POST /api/auth/register - Registers a new user account.

POST /api/auth/login - Authenticates credentials and returns a valid JWT token.

Charging Sessions (/api/sessions)
POST /start?stationId={id} - Starts a new session if the user has no other active sessions and the chosen station is AVAILABLE.

POST /stop - Terminates the active session, dynamically calculates total energy consumed (kWh) based on duration (using an 11kW power rate template), and marks the station as AVAILABLE again.

GET / - Retrieves the complete charging history for the authenticated user, sorted in descending chronological order.

Technical Implementations and Optimizations
Global Exception Handling: Integrated @RestControllerAdvice to globally catch application errors, translating them into consistent HTTP statuses (400 Bad Request, 404 Not Found) with clean JSON error payloads.

DTO Decoupling: All REST controllers strictly communicate using Data Transfer Objects (DTOs) to safely separate internal models from the API response layer and completely eliminate Jackson serialization errors tied to Hibernate lazy-loading proxies.