# Bank Management System

A sample Bank Management System using **Event Sourcing** and **CQRS** principles.

## Architecture

This project is built using:
- **Node.js** & **Express**
- **PostgreSQL** for event storage and read models
- **Event Sourcing** for reliable state reconstruction
- **Docker** for easy environment setup

## Project Structure
- `app/`: Source code for the Node.js application
  - `src/commands.js`: Command handlers for modifying state
  - `src/queries/`: Query handlers for reading state
  - `src/domain/`: Domain models (aggregates)
  - `src/projections/`: Logic for projecting events to read models
- `seeds/`: SQL scripts for database initialization

## Setup and Run

### Prerequisites
- Docker & Docker Compose

### running the Application
1. Clone the repository.
2. Create a `.env` file based on `.env.example`.
3. Start the services:
   ```bash
   docker-compose up --build
   ```

## API Endpoints (Planned)
- `GET /health`: System health check
