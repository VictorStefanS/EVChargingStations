# EVCharge

EVCharge is a full-stack electric vehicle charging management platform built to model a real-world charging infrastructure workflow. The project combines secure user authentication, charging session management, and station availability logic to provide a reliable backend service with a modern front-end interface.

## Overview

This project was designed to solve a common operational challenge in EV infrastructure: ensuring users can register securely, start and stop charging sessions safely, and track energy usage with consistent business rules. The application handles station state transitions, enforces user constraints, and protects sensitive endpoints using JWT-based authentication.

## Key Features

- Secure registration and login flow with Spring Security and JWT
- Charging station availability tracking and validation
- Session start/stop controls with business-rule enforcement
- Dynamic energy consumption calculation based on session duration
- User-specific charging history and session retrieval
- Clean REST API structure with DTO-based response handling
- Global exception management for consistent API error responses
- Swagger/OpenAPI integration for API exploration and testing

## Tech Stack

- Java 17
- Spring Boot 3
- Spring Security
- JWT Authentication
- Spring Data JPA / Hibernate
- PostgreSQL
- Lombok
- Maven
- React + TypeScript + Vite
- HTML / CSS / JavaScript

## Architecture

The application follows a layered backend architecture:

- Controller: Exposes REST endpoints and maps database entities to DTOs
- Service: Encapsulates core business logic such as session lifecycle and charge calculations
- Repository: Handles persistence with Spring Data JPA
- Model / DTO: Separates internal data entities from external API contracts
- Security Layer: Protects routes and authenticates users using JWT tokens

## Core Functionality

### Authentication

- `POST /api/auth/register` — create a new user account
- `POST /api/auth/login` — authenticate credentials and return a JWT

### Charging Sessions

- `POST /api/sessions/start?stationId={id}` — begin a session if the user is eligible and the station is available
- `POST /api/sessions/stop` — end the active session and calculate energy consumed
- `GET /api/sessions` — fetch the authenticated user’s charging history

## Business Rules Implemented

- A user cannot start multiple active charging sessions at once
- A station must be available before a new session can begin
- Charging duration is used to calculate energy usage with a defined power profile
- Only authenticated users can access their own session data
- API errors are centralized and returned in a consistent format

## Project Highlights

- Built a secure authentication system using modern Spring Security patterns
- Implemented business validation for charging lifecycle operations
- Reduced serialization and API exposure issues by separating entities from DTOs
- Designed a clear and maintainable backend structure suitable for scalable feature expansion
- Delivered a portfolio-ready project demonstrating backend engineering, API design, and system logic

## Getting Started

### Prerequisites

- Java 17+
- Maven
- PostgreSQL
- Node.js and npm (for the frontend)

### Backend

```bash
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```text
EVCharge/
├── src/                # Spring Boot backend source code
├── frontend/           # React + TypeScript client application
├── pom.xml             # Maven configuration
├── mvnw                # Maven wrapper
├── README.md           # Project overview and setup documentation
└── target/             # Build output
```

